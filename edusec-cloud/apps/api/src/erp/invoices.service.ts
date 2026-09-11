import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { LineItemDto } from "./dto/line-item.dto";

const MODULE = "erp.invoices";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** subtotal/totalAmount are always computed here from lineItems, never
 * accepted from the client — so an Invoice's numbers can never disagree
 * with its own line items. */
function computeTotals(lineItems: LineItemDto[], discountAmount: number, taxAmount: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
  return { subtotal: round2(subtotal), totalAmount: round2(totalAmount) };
}

/**
 * Invoices (ERP Phase 2 — financial and operational management, requested
 * directly by the user). Branch-scoped directly like Batch (not
 * transitively through Enrollment), since a finance officer issues an
 * invoice from one specific branch and an invoice can exist with no
 * enrollment at all (a one-off charge). enrollmentId is optional so an
 * invoice can still be linked back to the class/program it bills for when
 * there is one. Branch-scoped directly like Batch, same BranchScopeService,
 * same view/edit split already proven on Batches/Students.
 */
@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly audit: AuditService,
  ) {}

  async list(user: AccessTokenPayload, filters: { branchId?: string; studentId?: string; status?: string }) {
    const branchFilter = await this.branchScope.buildBranchFilter(user, "view", MODULE);

    if (filters.branchId) {
      await this.branchScope.assertCanAccessBranch(user, filters.branchId, "view", MODULE);
    }

    return this.prisma.invoice.findMany({
      where: {
        tenantId: user.tenantId,
        branchId: filters.branchId ?? branchFilter,
        studentId: filters.studentId,
        status: (filters.status as any) || undefined,
      },
      include: {
        branch: true,
        student: true,
        enrollment: { include: { batch: true } },
        payments: true,
      },
      orderBy: { issueDate: "desc" },
    });
  }

  async get(user: AccessTokenPayload, invoiceId: string) {
    const invoice = await this.getOrThrow(user.tenantId, invoiceId);
    await this.branchScope.assertCanAccessBranch(user, invoice.branchId, "view", MODULE);
    return invoice;
  }

  async create(user: AccessTokenPayload, dto: CreateInvoiceDto) {
    await this.branchScope.assertCanAccessBranch(user, dto.branchId, "edit", MODULE);

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId: user.tenantId } });
    if (!student) throw new NotFoundException("Student not found");

    if (dto.enrollmentId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { id: dto.enrollmentId, tenantId: user.tenantId },
      });
      if (!enrollment) throw new NotFoundException("Enrollment not found");
    }

    const { subtotal, totalAmount } = computeTotals(dto.lineItems, dto.discountAmount ?? 0, dto.taxAmount ?? 0);
    const invoiceNumber = await this.nextInvoiceNumber(user.tenantId);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId: user.tenantId,
        branchId: dto.branchId,
        studentId: dto.studentId,
        enrollmentId: dto.enrollmentId,
        invoiceNumber,
        currency: dto.currency ?? "OMR",
        lineItems: dto.lineItems as any,
        subtotal,
        discountAmount: dto.discountAmount ?? 0,
        taxAmount: dto.taxAmount ?? 0,
        totalAmount,
        status: dto.status ?? "DRAFT",
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: { branch: true, student: true, enrollment: true, payments: true },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.invoice.create",
      entityType: "Invoice",
      entityId: invoice.id,
      after: invoice,
    });

    return invoice;
  }

  async update(user: AccessTokenPayload, invoiceId: string, dto: UpdateInvoiceDto) {
    const before = await this.getOrThrow(user.tenantId, invoiceId);
    await this.branchScope.assertCanAccessBranch(user, before.branchId, "edit", MODULE);

    if (dto.branchId && dto.branchId !== before.branchId) {
      await this.branchScope.assertCanAccessBranch(user, dto.branchId, "edit", MODULE);
    }

    let totals: { subtotal?: number; totalAmount?: number } = {};
    if (dto.lineItems || dto.discountAmount !== undefined || dto.taxAmount !== undefined) {
      const lineItems = dto.lineItems ?? (before.lineItems as unknown as LineItemDto[]);
      const discountAmount = dto.discountAmount ?? Number(before.discountAmount);
      const taxAmount = dto.taxAmount ?? Number(before.taxAmount);
      totals = computeTotals(lineItems, discountAmount, taxAmount);
    }

    const invoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        branchId: dto.branchId,
        studentId: dto.studentId,
        enrollmentId: dto.enrollmentId,
        currency: dto.currency,
        lineItems: dto.lineItems as any,
        discountAmount: dto.discountAmount,
        taxAmount: dto.taxAmount,
        subtotal: totals.subtotal,
        totalAmount: totals.totalAmount,
        status: dto.status,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: { branch: true, student: true, enrollment: true, payments: true },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.invoice.update",
      entityType: "Invoice",
      entityId: invoice.id,
      before,
      after: invoice,
    });

    return invoice;
  }

  async remove(user: AccessTokenPayload, invoiceId: string) {
    const invoice = await this.getOrThrow(user.tenantId, invoiceId);
    await this.branchScope.assertCanAccessBranch(user, invoice.branchId, "edit", MODULE);

    const succeededPayments = await this.prisma.payment.count({ where: { invoiceId, status: "SUCCEEDED" } });
    if (succeededPayments > 0) {
      throw new BadRequestException(
        "Cannot delete an invoice with a successful payment recorded against it — cancel it instead.",
      );
    }

    await this.prisma.invoice.delete({ where: { id: invoiceId } });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.invoice.delete",
      entityType: "Invoice",
      entityId: invoiceId,
      before: invoice,
    });

    return { id: invoiceId, deleted: true };
  }

  /** Sum of SUCCEEDED payments against this invoice — the single source of
   * truth for how much is actually paid (Invoice stores no "amount paid"
   * field of its own; see the schema comment on Invoice/Payment). */
  async getBalance(user: AccessTokenPayload, invoiceId: string) {
    const invoice = await this.getOrThrow(user.tenantId, invoiceId);
    await this.branchScope.assertCanAccessBranch(user, invoice.branchId, "view", MODULE);

    const paid = await this.prisma.payment.aggregate({
      where: { invoiceId, status: "SUCCEEDED" },
      _sum: { amount: true },
    });
    const paidAmount = Number(paid._sum.amount ?? 0);
    const totalAmount = Number(invoice.totalAmount);
    return { totalAmount, paidAmount, balanceDue: round2(totalAmount - paidAmount) };
  }

  /**
   * Records that this invoice was just emailed to the student as a payment
   * notice (the user's direct request), stamping sentAt and, for a DRAFT
   * invoice, flipping status to SENT — the InvoiceStatus enum already
   * models exactly this ("SENT"), so no new state was introduced for it.
   * Called by InvoicesController only after InvoiceEmailService has
   * actually delivered the message.
   */
  async markSent(user: AccessTokenPayload, invoiceId: string) {
    const invoice = await this.getOrThrow(user.tenantId, invoiceId);
    await this.branchScope.assertCanAccessBranch(user, invoice.branchId, "edit", MODULE);

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        sentAt: new Date(),
        status: invoice.status === "DRAFT" ? "SENT" : undefined,
      },
      include: { branch: true, student: true, enrollment: true, payments: true },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.invoice.email_sent",
      entityType: "Invoice",
      entityId: invoice.id,
      after: { sentAt: updated.sentAt, status: updated.status },
    });

    return updated;
  }

  private async getOrThrow(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { branch: true, student: true, enrollment: true, payments: true },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");
    return invoice;
  }

  /** INV-{year}-{00001}, unique per tenant. Retries a couple of times on the
   * rare race of two invoices created in the same instant, since
   * invoice_number is unique-constrained at the DB level regardless. */
  private async nextInvoiceNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `INV-${year}-${String(count + 1 + attempt).padStart(5, "0")}`;
      const exists = await this.prisma.invoice.findFirst({ where: { tenantId, invoiceNumber: candidate } });
      if (!exists) return candidate;
    }
    return `INV-${year}-${Date.now()}`;
  }
}
