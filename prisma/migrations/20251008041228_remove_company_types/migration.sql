/*
  Warnings:

  - The values [SUPPLIER,OTHER] on the enum `CompanyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CompanyType_new" AS ENUM ('PROJECT', 'CUSTOMER');
ALTER TABLE "public"."Company" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Company" ALTER COLUMN "type" TYPE "public"."CompanyType_new" USING ("type"::text::"public"."CompanyType_new");
ALTER TYPE "public"."CompanyType" RENAME TO "CompanyType_old";
ALTER TYPE "public"."CompanyType_new" RENAME TO "CompanyType";
DROP TYPE "public"."CompanyType_old";
ALTER TABLE "public"."Company" ALTER COLUMN "type" SET DEFAULT 'PROJECT';
COMMIT;
