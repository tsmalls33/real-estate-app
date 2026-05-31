/*
  Warnings:

  - You are about to alter the column `numberOfBathrooms` on the `PropertyStats` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE "public"."PropertyStats" ALTER COLUMN "numberOfBathrooms" SET DATA TYPE DECIMAL(3,1);
