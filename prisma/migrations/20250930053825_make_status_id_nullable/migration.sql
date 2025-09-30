-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_statusId_fkey";

-- AlterTable
ALTER TABLE "public"."Project" ALTER COLUMN "statusId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."_ProjectExecutors" ADD CONSTRAINT "_ProjectExecutors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_ProjectExecutors_AB_unique";

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "public"."ProjectStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
