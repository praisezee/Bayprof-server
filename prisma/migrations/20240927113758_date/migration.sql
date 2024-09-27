-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expire_date" TEXT,
ADD COLUMN     "isTrading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_date" TEXT;
