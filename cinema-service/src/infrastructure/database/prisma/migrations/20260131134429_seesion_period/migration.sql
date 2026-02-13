/*
  Warnings:

  - Added the required column `endTime` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "endTime" TIMESTAMPTZ NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TIMESTAMPTZ;
