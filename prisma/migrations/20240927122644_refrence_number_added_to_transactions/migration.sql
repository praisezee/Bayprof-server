/*
  Warnings:

  - The required column `refrence_number` was added to the `Transaction` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refrence_number" TEXT NOT NULL;
