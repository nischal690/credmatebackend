-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('PERSONAL', 'BUSINESS', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "creditType" "CreditType" NOT NULL DEFAULT 'PERSONAL',
    "requestId" TEXT NOT NULL,
    "requestByUserId" TEXT NOT NULL,
    "requestedToUserId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "timeUnit" "TimeUnit" NOT NULL DEFAULT 'MONTHS',
    "interestRate" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'EMI',
    "emiFrequency" "EMIFrequency" NOT NULL DEFAULT 'MONTHLY',
    "status" "CreditStatus" NOT NULL DEFAULT 'ACTIVE',
    "offeredId" TEXT,
    "recoveryMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "offeredByUserId" TEXT NOT NULL,
    "offeredToUserId" TEXT NOT NULL,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credits_requestId_idx" ON "credits"("requestId");

-- CreateIndex
CREATE INDEX "credits_requestByUserId_idx" ON "credits"("requestByUserId");

-- CreateIndex
CREATE INDEX "credits_requestedToUserId_idx" ON "credits"("requestedToUserId");

-- CreateIndex
CREATE INDEX "credits_offeredByUserId_idx" ON "credits"("offeredByUserId");

-- CreateIndex
CREATE INDEX "credits_offeredToUserId_idx" ON "credits"("offeredToUserId");
