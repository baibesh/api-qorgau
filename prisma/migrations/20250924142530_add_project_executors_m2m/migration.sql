-- Drop old single-executor relation if it still exists
ALTER TABLE "public"."Project" DROP CONSTRAINT IF EXISTS "Project_executorId_fkey";
ALTER TABLE "public"."Project" DROP COLUMN IF EXISTS "executorId";

-- Create implicit many-to-many join table for Project.executors
CREATE TABLE IF NOT EXISTS "public"."_ProjectExecutors" (
  "A" INTEGER NOT NULL,
  "B" INTEGER NOT NULL
);

-- Ensure indexes for join table
CREATE UNIQUE INDEX IF NOT EXISTS "_ProjectExecutors_AB_unique" ON "public"."_ProjectExecutors"("A", "B");
CREATE INDEX IF NOT EXISTS "_ProjectExecutors_B_index" ON "public"."_ProjectExecutors"("B");

-- Add foreign keys with cascade semantics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = '_ProjectExecutors_A_fkey'
  ) THEN
    ALTER TABLE "public"."_ProjectExecutors"
    ADD CONSTRAINT "_ProjectExecutors_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = '_ProjectExecutors_B_fkey'
  ) THEN
    ALTER TABLE "public"."_ProjectExecutors"
    ADD CONSTRAINT "_ProjectExecutors_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;