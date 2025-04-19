/*
  Warnings:

  - You are about to drop the column `created` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "created",
DROP COLUMN "recurring";
