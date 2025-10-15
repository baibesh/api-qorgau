-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_ASSIGNED', 'PROJECT_COMMENT', 'USER_MENTIONED', 'FILE_UPLOADED', 'DEADLINE_APPROACHING', 'STATUS_CHANGED', 'SYSTEM_ANNOUNCEMENT');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 50,
    "projectCreated" BOOLEAN NOT NULL DEFAULT true,
    "projectUpdated" BOOLEAN NOT NULL DEFAULT true,
    "projectAssigned" BOOLEAN NOT NULL DEFAULT true,
    "projectComment" BOOLEAN NOT NULL DEFAULT true,
    "userMentioned" BOOLEAN NOT NULL DEFAULT true,
    "fileUploaded" BOOLEAN NOT NULL DEFAULT true,
    "deadlineApproaching" BOOLEAN NOT NULL DEFAULT true,
    "statusChanged" BOOLEAN NOT NULL DEFAULT true,
    "systemAnnouncement" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_notification_user_read_deleted" ON "public"."Notification"("userId", "isRead", "isDeleted");

-- CreateIndex
CREATE INDEX "idx_notification_user_created" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_notification_created_at" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "idx_notification_type" ON "public"."Notification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "public"."NotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
