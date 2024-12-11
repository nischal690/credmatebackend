-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('DAYS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('EMI', 'BULLET');

-- CreateEnum
CREATE TYPE "EMIFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CreditRequestStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'NEGOTIATED');

-- CreateTable
CREATE TABLE "credit_requests" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "requestByUserId" TEXT NOT NULL,
    "requestedToUserId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "timeUnit" "TimeUnit" NOT NULL DEFAULT 'MONTHS',
    "interestRate" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'EMI',
    "emiFrequency" "EMIFrequency" NOT NULL DEFAULT 'MONTHLY',
    "status" "CreditRequestStatus" NOT NULL DEFAULT 'PROPOSED',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_requests_parentId_idx" ON "credit_requests"("parentId");

-- CreateIndex
CREATE INDEX "credit_requests_requestByUserId_idx" ON "credit_requests"("requestByUserId");

-- CreateIndex
CREATE INDEX "credit_requests_requestedToUserId_idx" ON "credit_requests"("requestedToUserId");
