/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_id_user_fkey";

-- AlterTable
ALTER TABLE "public"."Client" ALTER COLUMN "id_user" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "fullName",
ADD COLUMN     "firstName" VARCHAR(40),
ADD COLUMN     "lastName" VARCHAR(40);

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."User"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
