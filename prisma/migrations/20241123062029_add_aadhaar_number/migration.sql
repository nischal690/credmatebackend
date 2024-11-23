/*
  Warnings:

  - A unique constraint covering the columns `[aadhaarNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aadhaarNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaarNumber_key" ON "users"("aadhaarNumber");
