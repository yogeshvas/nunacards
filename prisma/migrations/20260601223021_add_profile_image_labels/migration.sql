-- AlterTable
ALTER TABLE "User" ADD COLUMN     "labels" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "profileImage" TEXT;
