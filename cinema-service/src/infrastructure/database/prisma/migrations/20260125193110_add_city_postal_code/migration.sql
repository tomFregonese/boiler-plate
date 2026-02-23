/*
  Warnings:

  - Added the required column `city` to the `cinemas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `cinemas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cinemas" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL;
