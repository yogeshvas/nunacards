-- CreateTable
CREATE TABLE "CardView" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "isUnique" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardView_employeeId_idx" ON "CardView"("employeeId");

-- AddForeignKey
ALTER TABLE "CardView" ADD CONSTRAINT "CardView_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
