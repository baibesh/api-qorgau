-- Remove ProjectType and its relations

-- 1) Drop FK from Project.projectTypeId to ProjectType
ALTER TABLE "public"."Project"
  DROP CONSTRAINT IF EXISTS "Project_projectTypeId_fkey";

-- 2) Drop column projectTypeId from Project (if exists)
ALTER TABLE "public"."Project"
  DROP COLUMN IF EXISTS "projectTypeId";

-- 3) Drop ProjectType table (if exists)
DROP TABLE IF EXISTS "public"."ProjectType";