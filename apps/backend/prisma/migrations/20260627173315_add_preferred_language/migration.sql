-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('EN', 'ES', 'CA');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "preferredLanguage" "public"."Language" NOT NULL DEFAULT 'EN';
