/*
  Warnings:

  - Added the required column `price` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePeriod` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PlanPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "pricePeriod" "public"."PlanPeriod" NOT NULL;
