-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "cooperative" TEXT NOT NULL DEFAULT 'OPTIONAL',
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'ALL',
ADD COLUMN     "maxAge" INTEGER,
ADD COLUMN     "minAge" INTEGER,
ADD COLUMN     "requiredDocuments" TEXT[],
ADD COLUMN     "totalFund" DECIMAL(14,2);
