-- AlterTable: make password nullable and add googleId
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable: add googleId column
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;

-- CreateIndex: unique constraint on googleId
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
