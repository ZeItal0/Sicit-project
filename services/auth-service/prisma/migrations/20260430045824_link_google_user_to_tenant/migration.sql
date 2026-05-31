-- AlterTable
ALTER TABLE "google_users" ADD COLUMN     "tenant_id" TEXT;

-- AddForeignKey
ALTER TABLE "google_users" ADD CONSTRAINT "google_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
