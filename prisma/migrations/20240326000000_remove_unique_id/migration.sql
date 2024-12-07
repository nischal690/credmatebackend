-- DropIndex
DROP INDEX IF EXISTS "users_uniqueId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "uniqueId";
