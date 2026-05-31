-- AlterTable: Add id_tenant to Client
ALTER TABLE "public"."Client" ADD COLUMN "id_tenant" TEXT;

-- AlterTable: Add id_tenant to AgentPayment
ALTER TABLE "public"."AgentPayment" ADD COLUMN "id_tenant" TEXT;

-- DropIndex: Remove global unique on Property.propertyName
DROP INDEX "public"."Property_propertyName_key";

-- CreateIndex: Compound unique on Property(propertyName, id_tenant)
CREATE UNIQUE INDEX "Property_propertyName_id_tenant_key" ON "public"."Property"("propertyName", "id_tenant");

-- CreateIndex: Tenant index on Client
CREATE INDEX "Client_id_tenant_idx" ON "public"."Client"("id_tenant");

-- CreateIndex: Tenant index on AgentPayment
CREATE INDEX "AgentPayment_id_tenant_idx" ON "public"."AgentPayment"("id_tenant");

-- AddForeignKey: Client -> Tenant
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_id_tenant_fkey" FOREIGN KEY ("id_tenant") REFERENCES "public"."Tenant"("id_tenant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: AgentPayment -> Tenant
ALTER TABLE "public"."AgentPayment" ADD CONSTRAINT "AgentPayment_id_tenant_fkey" FOREIGN KEY ("id_tenant") REFERENCES "public"."Tenant"("id_tenant") ON DELETE SET NULL ON UPDATE CASCADE;
