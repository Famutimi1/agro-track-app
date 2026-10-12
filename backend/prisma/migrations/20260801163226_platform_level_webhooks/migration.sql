-- DropForeignKey
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_lenderOrgId_fkey";

-- AlterTable
ALTER TABLE "Webhook" ALTER COLUMN "lenderOrgId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_lenderOrgId_fkey" FOREIGN KEY ("lenderOrgId") REFERENCES "LenderOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
