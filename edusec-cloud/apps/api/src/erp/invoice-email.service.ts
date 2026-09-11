import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import type { Branch, Invoice, Student } from "@edusec/db";

type InvoiceForEmail = Invoice & {
  branch: Branch;
  student: Student;
};

/**
 * Emails an Invoice to its student as a payment notice, with the rendered
 * PDF (see InvoicePdfService) attached — the user's direct request. Uses
 * plain nodemailer against generic SMTP settings supplied via environment
 * variables, exactly mirroring how PaytabsProvider/ThawaniProvider are
 * configured with real merchant credentials the user supplies himself: no
 * account is created on his behalf here, and nothing is sent unless real
 * SMTP credentials for a mailbox he controls are present.
 *
 * Fails clearly with "not configured" (via isConfigured()) when SMTP env
 * vars are absent, the same pattern PaymentGatewayService uses for
 * PayTabs/Thawani — this lets the "Send Email" button be tested safely in
 * production before any real SMTP credentials exist, without ever risking
 * an actual email being sent to a real student during QA.
 */
@Injectable()
export class InvoiceEmailService {
  private readonly logger = new Logger(InvoiceEmailService.name);

  isConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
    );
  }

  private buildTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendInvoiceEmail(invoice: InvoiceForEmail, pdf: Buffer): Promise<void> {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        "Email is not configured yet — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM (any real mailbox/provider you control) to enable sending invoices by email.",
      );
    }
    if (!invoice.student.email) {
      throw new BadRequestException(
        "This student has no email address on file — add one before sending this invoice by email.",
      );
    }

    const money = (n: number | string) => `${invoice.currency} ${Number(n).toFixed(2)}`;
    const dueLine = invoice.dueDate
      ? ` Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.`
      : "";

    const transport = this.buildTransport();
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: invoice.student.email,
      subject: `Invoice ${invoice.invoiceNumber} — ${money(invoice.totalAmount)} due`,
      text: `Dear ${invoice.student.firstName},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${money(
        invoice.totalAmount,
      )}, issued by ${invoice.branch.branchName}.${dueLine}\n\nThank you.`,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    this.logger.log(`Invoice ${invoice.invoiceNumber} emailed to ${invoice.student.email}`);
  }
}
