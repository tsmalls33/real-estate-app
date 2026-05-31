/*
  Warnings:

  - You are about to drop the `themes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Tenant" DROP CONSTRAINT "Tenant_id_theme_fkey";

-- DropTable
DROP TABLE "public"."themes";

-- CreateTable
CREATE TABLE "public"."Theme" (
    "id_theme" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "secondary" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "logoIcon" TEXT,
    "logoBanner" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id_theme")
);

-- CreateIndex
CREATE INDEX "Theme_isDeleted_idx" ON "public"."Theme"("isDeleted");

-- AddForeignKey
ALTER TABLE "public"."Tenant" ADD CONSTRAINT "Tenant_id_theme_fkey" FOREIGN KEY ("id_theme") REFERENCES "public"."Theme"("id_theme") ON DELETE SET NULL ON UPDATE CASCADE;
