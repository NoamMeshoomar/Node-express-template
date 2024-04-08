/*
  Warnings:

  - You are about to alter the column `productIds` on the `savedcart` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `savedcart` MODIFY `productIds` JSON NULL;
