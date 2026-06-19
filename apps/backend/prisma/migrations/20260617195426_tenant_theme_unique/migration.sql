-- Enforce a 1:1 Tenant<->Theme relation: a theme row may be referenced by at
-- most one tenant. Prevents one admin's per-field theme edit from bleeding into
-- another tenant that shares the same theme row. NULL id_theme stays allowed for
-- many tenants (Postgres treats NULLs as distinct).

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_id_theme_key" ON "public"."Tenant"("id_theme");
