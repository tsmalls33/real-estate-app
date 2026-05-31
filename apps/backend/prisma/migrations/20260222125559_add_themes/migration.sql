-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "id_theme" TEXT;

-- CreateTable
CREATE TABLE "public"."themes" (
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

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id_theme")
);

-- CreateIndex
CREATE INDEX "themes_isDeleted_idx" ON "public"."themes"("isDeleted");

-- AddForeignKey
ALTER TABLE "public"."Tenant" ADD CONSTRAINT "Tenant_id_theme_fkey" FOREIGN KEY ("id_theme") REFERENCES "public"."themes"("id_theme") ON DELETE SET NULL ON UPDATE CASCADE;
