import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import type { Branch, Invoice, Student } from "@edusec/db";

type LineItem = { description: string; quantity: number; unitPrice: number };

type InvoiceForPdf = Invoice & {
  branch: Branch;
  student: Student;
};

/**
 * Renders an Invoice as a PDF using pdfkit — a pure-JS PDF library with no
 * headless-browser/Chromium dependency, chosen specifically to keep the
 * Railway API container lean (avoids adding Puppeteer/Chromium just to
 * render a one-page document). Used by both the on-demand "Download PDF"
 * endpoint and as the email attachment for "Send Email" (the user's direct
 * request: invoices sent as an email payment notice with a PDF copy, and a
 * PDF downloadable on demand at any time).
 */
@Injectable()
export class InvoicePdfService {
  generate(invoice: InvoiceForPdf): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const lineItems = ((invoice.lineItems as unknown as LineItem[]) ?? []).filter(Boolean);
      const money = (n: number | string) => `${invoice.currency} ${Number(n).toFixed(2)}`;

      // --- Header -----------------------------------------------------
      doc.fontSize(20).fillColor("#111").text("bxbii", { continued: false });
      doc.fontSize(10).fillColor("#666").text("Digital Business Ecosystem");
      doc.moveDown(1.5);

      doc.fillColor("#111").fontSize(16).text(`Invoice ${invoice.invoiceNumber}`);
      doc.fontSize(10).fillColor("#666");
      doc.text(`Issue date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
      if (invoice.dueDate) doc.text(`Due date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();

      // --- Billed to / From --------------------------------------------
      const colTop = doc.y;
      doc.fillColor("#111").fontSize(11).text("Billed to", 50, colTop);
      doc.fontSize(10).fillColor("#333");
      doc.text(`${invoice.student.firstName} ${invoice.student.lastName}`, 50);
      if (invoice.student.email) doc.text(invoice.student.email, 50);
      if (invoice.student.mobile) doc.text(invoice.student.mobile, 50);

      doc.fillColor("#111").fontSize(11).text("From", 320, colTop);
      doc.fontSize(10).fillColor("#333");
      doc.text(invoice.branch.branchName, 320);
      if (invoice.branch.addressLine1) doc.text(invoice.branch.addressLine1, 320);
      if (invoice.branch.city) doc.text(invoice.branch.city, 320);
      if (invoice.branch.phone) doc.text(invoice.branch.phone, 320);
      if (invoice.branch.email) doc.text(invoice.branch.email, 320);

      doc.moveDown(2);

      // --- Line items table ----------------------------------------------
      const col = { desc: 50, qty: 300, unit: 360, amount: 450 };
      let tableTop = Math.max(doc.y, colTop + 100);
      doc.rect(50, tableTop, 495, 20).fill("#1f2937");
      doc.fillColor("#fff").fontSize(10);
      doc.text("Description", col.desc + 5, tableTop + 5);
      doc.text("Qty", col.qty, tableTop + 5);
      doc.text("Unit Price", col.unit, tableTop + 5);
      doc.text("Amount", col.amount, tableTop + 5);

      let y = tableTop + 26;
      doc.fillColor("#111").fontSize(10);
      for (const item of lineItems) {
        const amount = item.quantity * item.unitPrice;
        doc.text(item.description, col.desc + 5, y, { width: 240 });
        doc.text(String(item.quantity), col.qty, y);
        doc.text(money(item.unitPrice), col.unit, y);
        doc.text(money(amount), col.amount, y);
        y += 20;
      }

      y += 8;
      doc.moveTo(320, y).lineTo(545, y).strokeColor("#ccc").stroke();
      y += 8;

      doc.fontSize(10).fillColor("#333");
      doc.text("Subtotal", 360, y);
      doc.text(money(invoice.subtotal), col.amount, y);
      y += 18;

      if (Number(invoice.discountAmount) > 0) {
        doc.text("Discount", 360, y);
        doc.text(`-${money(invoice.discountAmount)}`, col.amount, y);
        y += 18;
      }
      if (Number(invoice.taxAmount) > 0) {
        doc.text("Tax", 360, y);
        doc.text(money(invoice.taxAmount), col.amount, y);
        y += 18;
      }

      doc.fontSize(12).fillColor("#111").text("Total", 360, y);
      doc.text(money(invoice.totalAmount), col.amount, y);
      y += 34;

      if (invoice.notes) {
        doc.fontSize(10).fillColor("#666").text("Notes", 50, y);
        y += 15;
        doc.fillColor("#333").text(invoice.notes, 50, y, { width: 495 });
      }

      doc.end();
    });
  }
}
