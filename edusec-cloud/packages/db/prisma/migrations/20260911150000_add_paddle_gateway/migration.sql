-- Adds PADDLE to the PaymentGateway enum so invoices can be billed through
-- Paddle Billing, alongside the existing PAYTABS/THAWANI/MANUAL options
-- (user request: he created his own Paddle account and supplied a live API
-- key). Purely additive — existing rows are untouched, and this value is
-- simply unused until the "Pay via Paddle" button is actually clicked.
ALTER TYPE "PaymentGateway" ADD VALUE 'PADDLE';
