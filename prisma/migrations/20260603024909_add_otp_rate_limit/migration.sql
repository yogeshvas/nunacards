-- AlterTable
ALTER TABLE "OtpToken" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "sendCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sendWindowStart" TIMESTAMP(3);
