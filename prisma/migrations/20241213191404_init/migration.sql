-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('PRO_INDIVIDUAL', 'PRO_BUSINESS', 'PRIORITY_BUSINESS');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditRequestStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'NEGOTIATED');

-- CreateEnum
CREATE TYPE "CreditOfferStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'NEGOTIATED');

-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('PERSONAL', 'BUSINESS', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "name" TEXT,
    "businessType" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "phoneNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT,
    "panNumber" TEXT,
    "profileImageUrl" TEXT,
    "plan" "UserPlan",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_profiles" (
    "id" TEXT NOT NULL,
    "savedByUserId" TEXT NOT NULL,
    "savedUserId" TEXT NOT NULL,
    "name" TEXT,
    "mobileNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "saved_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rewardIssued" BOOLEAN NOT NULL DEFAULT false,
    "rewardPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_requests" (
    "id" TEXT NOT NULL,
    "parentRequestId" TEXT,
    "requestByUserId" TEXT NOT NULL,
    "requestedToUserId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "timeUnit" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT NOT NULL,
    "emiFrequency" TEXT NOT NULL,
    "status" "CreditRequestStatus" NOT NULL DEFAULT 'PROPOSED',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "credit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_offers" (
    "id" TEXT NOT NULL,
    "parentOfferId" TEXT,
    "offerByUserId" TEXT NOT NULL,
    "offerToUserId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "timeUnit" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT NOT NULL,
    "emiFrequency" TEXT NOT NULL,
    "status" "CreditOfferStatus" NOT NULL DEFAULT 'PROPOSED',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "credit_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "creditType" "CreditType" NOT NULL DEFAULT 'PERSONAL',
    "requestId" TEXT NOT NULL,
    "requestByUserId" TEXT NOT NULL,
    "requestedToUserId" TEXT NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "timeUnit" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT NOT NULL,
    "emiFrequency" TEXT NOT NULL,
    "status" "CreditStatus" NOT NULL DEFAULT 'ACTIVE',
    "offeredId" TEXT,
    "recoveryMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "offeredByUserId" TEXT NOT NULL,
    "offeredToUserId" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reported_borrowers" (
    "id" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "unpaidAmount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "confirmedByBorrower" BOOLEAN NOT NULL DEFAULT false,
    "borrowerCreatedAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recoveryMode" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "reported_borrowers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaarNumber_key" ON "users"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_panNumber_key" ON "users"("panNumber");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "saved_profiles_savedByUserId_idx" ON "saved_profiles"("savedByUserId");

-- CreateIndex
CREATE INDEX "saved_profiles_savedUserId_idx" ON "saved_profiles"("savedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_profiles_savedByUserId_savedUserId_key" ON "saved_profiles"("savedByUserId", "savedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referralCode_key" ON "referrals"("referralCode");

-- CreateIndex
CREATE INDEX "referrals_referrerUserId_idx" ON "referrals"("referrerUserId");

-- CreateIndex
CREATE INDEX "referrals_referredUserId_idx" ON "referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "credit_requests_parentRequestId_idx" ON "credit_requests"("parentRequestId");

-- CreateIndex
CREATE INDEX "credit_requests_requestByUserId_idx" ON "credit_requests"("requestByUserId");

-- CreateIndex
CREATE INDEX "credit_requests_requestedToUserId_idx" ON "credit_requests"("requestedToUserId");

-- CreateIndex
CREATE INDEX "credit_offers_parentOfferId_idx" ON "credit_offers"("parentOfferId");

-- CreateIndex
CREATE INDEX "credit_offers_offerByUserId_idx" ON "credit_offers"("offerByUserId");

-- CreateIndex
CREATE INDEX "credit_offers_offerToUserId_idx" ON "credit_offers"("offerToUserId");

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

-- CreateIndex
CREATE INDEX "reported_borrowers_reportedByUserId_idx" ON "reported_borrowers"("reportedByUserId");
