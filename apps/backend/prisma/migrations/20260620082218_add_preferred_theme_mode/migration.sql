-- CreateEnum
CREATE TYPE "public"."ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "preferredThemeMode" "public"."ThemeMode" NOT NULL DEFAULT 'SYSTEM';
