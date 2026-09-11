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

/**
* ERP module: Phase 1 (Institute Management System) — Batches (scheduled
* runs of a Program/Course at a branch) and Enrollments (Student <-> Batch);
* Phase 2 (financial and operational management, requested directly by the
* user) — Invoices, Payments, and the PayTabs/Thawani gateway integrations
* used to collect them online. Kept separate from CmsModule since this is
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
],
})
export class ErpModule {}
