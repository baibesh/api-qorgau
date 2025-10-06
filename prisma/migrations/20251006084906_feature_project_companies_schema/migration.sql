-- CreateEnum
CREATE TYPE "public"."CompanyType" AS ENUM ('PROJECT', 'CUSTOMER', 'SUPPLIER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CompanyAddedVia" AS ENUM ('MANUAL', 'IMPORT', 'API');

-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "addedVia" "public"."CompanyAddedVia" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" INTEGER,
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "originProjectId" INTEGER,
ADD COLUMN     "type" "public"."CompanyType" NOT NULL DEFAULT 'PROJECT';

-- AlterTable
ALTER TABLE "public"."RegistrationInvitation" ADD COLUMN     "companyId" INTEGER;

-- CreateTable
CREATE TABLE "public"."CompanyLog" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "changedBy" INTEGER,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_company_log_company_id" ON "public"."CompanyLog"("companyId");

-- CreateIndex
CREATE INDEX "idx_company_log_changed_by" ON "public"."CompanyLog"("changedBy");

-- CreateIndex
CREATE INDEX "idx_company_log_created_at" ON "public"."CompanyLog"("createdAt");

-- CreateIndex
CREATE INDEX "idx_company_log_company_created_at" ON "public"."CompanyLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_company_type" ON "public"."Company"("type");

-- CreateIndex
CREATE INDEX "idx_company_created_by_id" ON "public"."Company"("createdById");

-- CreateIndex
CREATE INDEX "idx_company_approved_by_id" ON "public"."Company"("approvedById");

-- CreateIndex
CREATE INDEX "idx_company_origin_project_id" ON "public"."Company"("originProjectId");

-- CreateIndex
CREATE INDEX "idx_company_created_at" ON "public"."Company"("createdAt");

-- CreateIndex
CREATE INDEX "idx_reginv_company_id" ON "public"."RegistrationInvitation"("companyId");

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_originProjectId_fkey" FOREIGN KEY ("originProjectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistrationInvitation" ADD CONSTRAINT "RegistrationInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyLog" ADD CONSTRAINT "CompanyLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyLog" ADD CONSTRAINT "CompanyLog_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
