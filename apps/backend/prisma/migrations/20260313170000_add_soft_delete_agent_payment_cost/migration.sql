-- AlterTable
ALTER TABLE "AgentPayment" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Cost" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
