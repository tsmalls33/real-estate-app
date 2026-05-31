-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CLIENT', 'EMPLOYEE', 'ADMIN', 'SUPERADMIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CLIENT',
    "id_tenant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id_tenant" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customDomain" TEXT,
    "id_plan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id_tenant")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "public"."Tenant"("name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_id_tenant_fkey" FOREIGN KEY ("id_tenant") REFERENCES "public"."Tenant"("id_tenant") ON DELETE SET NULL ON UPDATE CASCADE;
