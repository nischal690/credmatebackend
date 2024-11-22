/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "dateOfBirth",
ADD COLUMN     "date_of_birth" TIMESTAMP(3);
