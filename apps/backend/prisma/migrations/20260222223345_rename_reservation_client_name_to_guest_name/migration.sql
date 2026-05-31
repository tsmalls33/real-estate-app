/*
  Warnings:

  - You are about to drop the column `clientName` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `guestName` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "clientName",
ADD COLUMN     "guestName" TEXT NOT NULL;
