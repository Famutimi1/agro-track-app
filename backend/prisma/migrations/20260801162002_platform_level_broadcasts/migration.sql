-- AlterTable
ALTER TABLE "Broadcast" ALTER COLUMN "lenderOrgId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MessageTemplate" ALTER COLUMN "lenderOrgId" DROP NOT NULL;
