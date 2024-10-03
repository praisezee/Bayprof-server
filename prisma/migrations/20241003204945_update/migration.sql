-- CreateEnum
CREATE TYPE "Package" AS ENUM ('STARTER', 'BRONZE', 'SILVER', 'GOLD');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "package" "Package" NOT NULL DEFAULT 'STARTER';
