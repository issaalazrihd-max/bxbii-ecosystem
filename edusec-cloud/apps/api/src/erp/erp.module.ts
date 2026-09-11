import { Module } from "@nestjs/common";
import { BatchesController } from "./batches.controller";
import { EnrollmentsController } from "./enrollments.controller";
import { BatchesService } from "./batches.service";
import { EnrollmentsService } from "./enrollments.service";
import { InvoicesController } from "./invoices.controller";
import { PaymentsController } from "./payments.controller";
import { PaymentsWebhooksController } from "./payments-webhooks.controller";
import { InvoicesService } from "./invoices.service";
import { PaymentsService } from "./payments.service";
import { PaymentGatewayService } from "./payment-gateway/payment-gateway.service";
import { PaytabsProvider } from "./payment-gateway/paytabs.provider";
import { ThawaniProvider } from "./payment-gateway/thawani.provider";
import { PaddleProvider } from "./payment-gateway/paddle.provider";
import { InvoicePdfService } from "./invoice-pdf.service";
import { InvoiceEmailService } from "./invoice-email.service";

/**
 * ERP module: Phase 1 (Institute Management System) — Batches (scheduled
 * runs of a Program/Course at a branch) and Enrollments (Student <-> Batch);
 * Phase 2 (financial and operational management, requested directly by the
 * user) — Invoices, Payments, the PayTabs/Thawani/Paddle gateway
 * integrations used to collect them online, and PDF generation + email
 * delivery for invoices (also requested directly by the user: invoices sent
 * as an email payment notice with a PDF copy, and downloadable as PDF on
 * demand). Kept separate from CmsModule since this is
 * operational/academic/financial data, not website content.
 */
@Module({
  controllers: [
    BatchesController,
    EnrollmentsController,
    InvoicesController,
    PaymentsController,
    PaymentsWebhooksController,
  ],
  providers: [
    BatchesService,
    EnrollmentsService,
    InvoicesService,
    PaymentsService,
    PaymentGatewayService,
    PaytabsProvider,
    ThawaniProvider,
    PaddleProvider,
    InvoicePdfService,
    InvoiceEmailService,
  ],
})
export class ErpModule {}
