-- CreateTable
CREATE TABLE "tenant_hr_integration_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'CUSTOM_API',
    "api_url" TEXT NOT NULL,
    "api_token" TEXT NOT NULL,
    "employees_endpoint" TEXT NOT NULL,
    "sectors_endpoint" TEXT NOT NULL,
    "roles_endpoint" TEXT NOT NULL,
    "sync_employees" BOOLEAN NOT NULL DEFAULT true,
    "sync_roles" BOOLEAN NOT NULL DEFAULT true,
    "sync_sectors" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'Diaria',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_hr_integration_configs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tenant_hr_integration_configs" ADD CONSTRAINT "tenant_hr_integration_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
