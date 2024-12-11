-- AlterTable
ALTER TABLE "saved_profiles" 
ADD COLUMN IF NOT EXISTS "updatedOn" TIMESTAMP(3);

-- Update existing rows
UPDATE "saved_profiles" 
SET "updatedOn" = "createdAt"
WHERE "updatedOn" IS NULL;

-- Make the column required
ALTER TABLE "saved_profiles" 
ALTER COLUMN "updatedOn" SET NOT NULL,
ALTER COLUMN "updatedOn" SET DEFAULT CURRENT_TIMESTAMP;
