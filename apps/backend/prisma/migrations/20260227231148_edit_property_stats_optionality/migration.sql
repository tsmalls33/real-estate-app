-- AlterTable
ALTER TABLE "public"."PropertyStats" ALTER COLUMN "sizeSquareMeters" DROP NOT NULL,
ALTER COLUMN "yearBuilt" DROP NOT NULL,
ALTER COLUMN "hasElevator" DROP NOT NULL,
ALTER COLUMN "hasGarage" DROP NOT NULL;
