/*
  Warnings:

  - You are about to alter the column `customDomain` on the `Tenant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `fullName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[customDomain]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SaleType" AS ENUM ('RENT', 'SALE');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('BOOKING', 'AIRBNB', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CostType" AS ENUM ('CLEANING', 'TAX', 'PLATFORM_FEE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('AVAILABLE_SALE', 'AVAILABLE_RENTAL', 'INACTIVE', 'SOLD', 'UNDER_RENTAL');

-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "customDomain" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "fullName" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id_plan" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id_plan")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id_property" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "propertyAddress" VARCHAR(500) NOT NULL,
    "propertyDescription" VARCHAR(2000),
    "coverImage" TEXT,
    "agentFeePercentage" DECIMAL(5,4),
    "salePrice" DECIMAL(12,2),
    "saleType" "public"."SaleType",
    "id_owner" TEXT,
    "id_agent" TEXT,
    "id_tenant" TEXT,
    "status" "public"."PropertyStatus" NOT NULL DEFAULT 'AVAILABLE_RENTAL',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id_property")
);

-- CreateTable
CREATE TABLE "public"."PropertyStats" (
    "id_property_stats" TEXT NOT NULL,
    "id_property" TEXT NOT NULL,
    "numberOfBedrooms" INTEGER NOT NULL,
    "numberOfBathrooms" INTEGER NOT NULL,
    "sizeSquareMeters" DECIMAL(10,2) NOT NULL,
    "propertyType" "public"."PropertyType" NOT NULL,
    "location" TEXT NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "floorNumber" INTEGER,
    "hasElevator" BOOLEAN NOT NULL,
    "hasGarage" BOOLEAN NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyStats_pkey" PRIMARY KEY ("id_property_stats")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id_reservation" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalCost" DECIMAL(10,2) NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'UPCOMING',
    "dateCancelled" TIMESTAMP(3),
    "id_property" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateTable
CREATE TABLE "public"."Cost" (
    "id_cost" TEXT NOT NULL,
    "costType" "public"."CostType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "id_property" TEXT,
    "id_reservation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id_cost")
);

-- CreateTable
CREATE TABLE "public"."AgentPayment" (
    "id_agent_payment" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "id_user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentPayment_pkey" PRIMARY KEY ("id_agent_payment")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id_photo" TEXT NOT NULL,
    "filename" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "id_property" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id_photo")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id_client" TEXT NOT NULL,
    "firstName" VARCHAR(40) NOT NULL,
    "lastName" VARCHAR(40),
    "email" VARCHAR(255),
    "phoneNumber" VARCHAR(30),
    "notes" TEXT,
    "id_user" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "public"."FeeRule" (
    "id_fee_rule" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeRule_pkey" PRIMARY KEY ("id_fee_rule")
);

-- CreateTable
CREATE TABLE "public"."_FeeRuleToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FeeRuleToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "public"."Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_propertyName_key" ON "public"."Property"("propertyName");

-- CreateIndex
CREATE INDEX "Property_id_tenant_idx" ON "public"."Property"("id_tenant");

-- CreateIndex
CREATE INDEX "Property_id_owner_idx" ON "public"."Property"("id_owner");

-- CreateIndex
CREATE INDEX "Property_saleType_idx" ON "public"."Property"("saleType");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyStats_id_property_key" ON "public"."PropertyStats"("id_property");

-- CreateIndex
CREATE INDEX "PropertyStats_id_property_idx" ON "public"."PropertyStats"("id_property");

-- CreateIndex
CREATE INDEX "Reservation_id_property_startDate_idx" ON "public"."Reservation"("id_property", "startDate");

-- CreateIndex
CREATE INDEX "Reservation_startDate_endDate_idx" ON "public"."Reservation"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Cost_id_property_idx" ON "public"."Cost"("id_property");

-- CreateIndex
CREATE INDEX "Cost_id_reservation_idx" ON "public"."Cost"("id_reservation");

-- CreateIndex
CREATE INDEX "Photo_id_property_idx" ON "public"."Photo"("id_property");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FeeRule_name_key" ON "public"."FeeRule"("name");

-- CreateIndex
CREATE INDEX "_FeeRuleToProperty_B_index" ON "public"."_FeeRuleToProperty"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "public"."Tenant"("customDomain");

-- CreateIndex
CREATE INDEX "User_id_tenant_idx" ON "public"."User"("id_tenant");

-- AddForeignKey
ALTER TABLE "public"."Tenant" ADD CONSTRAINT "Tenant_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "public"."Plan"("id_plan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "public"."User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_id_agent_fkey" FOREIGN KEY ("id_agent") REFERENCES "public"."User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_id_tenant_fkey" FOREIGN KEY ("id_tenant") REFERENCES "public"."Tenant"("id_tenant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyStats" ADD CONSTRAINT "PropertyStats_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "public"."Property"("id_property") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "public"."Property"("id_property") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cost" ADD CONSTRAINT "Cost_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "public"."Property"("id_property") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cost" ADD CONSTRAINT "Cost_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "public"."Reservation"("id_reservation") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentPayment" ADD CONSTRAINT "AgentPayment_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "public"."Property"("id_property") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FeeRuleToProperty" ADD CONSTRAINT "_FeeRuleToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."FeeRule"("id_fee_rule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FeeRuleToProperty" ADD CONSTRAINT "_FeeRuleToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Property"("id_property") ON DELETE CASCADE ON UPDATE CASCADE;
