-- Rename theme color columns to reflect the new tenant-theming semantics:
--   primary   -> backgroundColor
--   secondary -> brandColor
--   accent    -> secondaryColor
-- Uses RENAME COLUMN to preserve existing row data; a Prisma-generated
-- DROP/ADD would have wiped seeded themes.
--
-- camelCase is the convention for non-id columns in this schema
-- (createdAt, propertyName, firstName, etc.) — id_* is the only exception.

ALTER TABLE "public"."Theme" RENAME COLUMN "primary"   TO "backgroundColor";
ALTER TABLE "public"."Theme" RENAME COLUMN "secondary" TO "brandColor";
ALTER TABLE "public"."Theme" RENAME COLUMN "accent"    TO "secondaryColor";
