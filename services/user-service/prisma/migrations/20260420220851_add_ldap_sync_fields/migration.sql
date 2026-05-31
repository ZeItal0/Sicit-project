-- AlterTable
ALTER TABLE "users" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "last_sync_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'LOCAL';
