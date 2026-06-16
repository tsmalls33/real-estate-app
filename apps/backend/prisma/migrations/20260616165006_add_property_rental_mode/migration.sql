-- CreateEnum
CREATE TYPE "public"."RentalMode" AS ENUM ('SHORT_TERM', 'LONG_TERM', 'HYBRID');

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "rentalMode" "public"."RentalMode";

-- Backfill any existing RENT rows so the CHECK below can be safely added.
-- SHORT_TERM is the business default — most properties are nightly via Airbnb/Booking.
UPDATE "public"."Property"
SET "rentalMode" = 'SHORT_TERM'
WHERE "saleType" = 'RENT' AND "rentalMode" IS NULL;

-- Conditional requirement: rentalMode must be set when saleType = RENT.
-- saleType is nullable; only the RENT case requires rentalMode.
ALTER TABLE "public"."Property"
ADD CONSTRAINT "property_rental_mode_required_when_rent"
CHECK (
  "saleType" IS DISTINCT FROM 'RENT' OR "rentalMode" IS NOT NULL
);
