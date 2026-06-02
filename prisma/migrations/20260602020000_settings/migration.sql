-- AlterTable Organization
ALTER TABLE "Organization" ADD COLUMN "planExpiresAt" TIMESTAMP(3);

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable LoginSession
CREATE TABLE "LoginSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoginSession_userId_idx" ON "LoginSession"("userId");

ALTER TABLE "LoginSession" ADD CONSTRAINT "LoginSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
