/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `KanbanBoard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `KanbanBoard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."KanbanBoard" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."KanbanBoardMember" (
    "id" SERIAL NOT NULL,
    "boardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanbanBoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KanbanBoardMember_boardId_userId_key" ON "public"."KanbanBoardMember"("boardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanBoard_code_key" ON "public"."KanbanBoard"("code");

-- AddForeignKey
ALTER TABLE "public"."KanbanBoardMember" ADD CONSTRAINT "KanbanBoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."KanbanBoard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KanbanBoardMember" ADD CONSTRAINT "KanbanBoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
