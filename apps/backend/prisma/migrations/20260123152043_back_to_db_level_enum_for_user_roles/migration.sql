/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRoles" AS ENUM ('ADMIN', 'SUPERADMIN', 'CLIENT', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRoles" NOT NULL DEFAULT 'CLIENT';
