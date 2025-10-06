-- CreateIndex
CREATE INDEX "idx_company_region_id" ON "public"."Company"("regionId");

-- CreateIndex
CREATE INDEX "idx_file_created_by" ON "public"."File"("createdBy");

-- CreateIndex
CREATE INDEX "idx_file_created_at" ON "public"."File"("createdAt");

-- CreateIndex
CREATE INDEX "idx_file_mime_type" ON "public"."File"("mimeType");

-- CreateIndex
CREATE INDEX "idx_file_creator_created_at" ON "public"."File"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "idx_kbm_board_id" ON "public"."KanbanBoardMember"("boardId");

-- CreateIndex
CREATE INDEX "idx_kbm_user_id" ON "public"."KanbanBoardMember"("userId");

-- CreateIndex
CREATE INDEX "idx_kanban_column_board_id" ON "public"."KanbanColumn"("boardId");

-- CreateIndex
CREATE INDEX "idx_kanban_column_position" ON "public"."KanbanColumn"("position");

-- CreateIndex
CREATE INDEX "idx_project_region_id" ON "public"."Project"("regionId");

-- CreateIndex
CREATE INDEX "idx_project_status_id" ON "public"."Project"("statusId");

-- CreateIndex
CREATE INDEX "idx_project_company_id" ON "public"."Project"("companyId");

-- CreateIndex
CREATE INDEX "idx_project_created_by" ON "public"."Project"("createdBy");

-- CreateIndex
CREATE INDEX "idx_project_kanban_column_id" ON "public"."Project"("kanbanColumnId");

-- CreateIndex
CREATE INDEX "idx_project_expected_deadline" ON "public"."Project"("expectedDeadline");

-- CreateIndex
CREATE INDEX "idx_project_created_at" ON "public"."Project"("createdAt");

-- CreateIndex
CREATE INDEX "idx_project_region_status" ON "public"."Project"("regionId", "statusId");

-- CreateIndex
CREATE INDEX "idx_project_company_status" ON "public"."Project"("companyId", "statusId");

-- CreateIndex
CREATE INDEX "idx_project_creator_created_at" ON "public"."Project"("createdBy", "createdAt");

-- CreateIndex
CREATE INDEX "idx_project_status_deadline" ON "public"."Project"("statusId", "expectedDeadline");

-- CreateIndex
CREATE INDEX "idx_project_comment_project_id" ON "public"."ProjectComment"("projectId");

-- CreateIndex
CREATE INDEX "idx_project_comment_author_id" ON "public"."ProjectComment"("authorId");

-- CreateIndex
CREATE INDEX "idx_project_comment_created_at" ON "public"."ProjectComment"("createdAt");

-- CreateIndex
CREATE INDEX "idx_project_comment_project_created_at" ON "public"."ProjectComment"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_project_log_project_id" ON "public"."ProjectLog"("projectId");

-- CreateIndex
CREATE INDEX "idx_project_log_changed_by" ON "public"."ProjectLog"("changedBy");

-- CreateIndex
CREATE INDEX "idx_project_log_created_at" ON "public"."ProjectLog"("createdAt");

-- CreateIndex
CREATE INDEX "idx_project_log_project_created_at" ON "public"."ProjectLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_reginv_email" ON "public"."RegistrationInvitation"("email");

-- CreateIndex
CREATE INDEX "idx_reginv_status" ON "public"."RegistrationInvitation"("status");

-- CreateIndex
CREATE INDEX "idx_reginv_expires_at" ON "public"."RegistrationInvitation"("expires_at");

-- CreateIndex
CREATE INDEX "idx_reginv_invited_by" ON "public"."RegistrationInvitation"("invited_by");

-- CreateIndex
CREATE INDEX "idx_reginv_role_id" ON "public"."RegistrationInvitation"("role_id");

-- CreateIndex
CREATE INDEX "idx_reginv_status_expires" ON "public"."RegistrationInvitation"("status", "expires_at");

-- CreateIndex
CREATE INDEX "idx_role_created_by" ON "public"."Role"("createdBy");

-- CreateIndex
CREATE INDEX "idx_role_permission_role_id" ON "public"."RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "idx_role_permission_permission_id" ON "public"."RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "idx_role_permission_granted_by" ON "public"."RolePermission"("grantedBy");

-- CreateIndex
CREATE INDEX "idx_user_region_id" ON "public"."User"("region_id");

-- CreateIndex
CREATE INDEX "idx_user_status" ON "public"."User"("status");

-- CreateIndex
CREATE INDEX "idx_user_is_deleted" ON "public"."User"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_user_created_by" ON "public"."User"("created_by");

-- CreateIndex
CREATE INDEX "idx_user_last_login" ON "public"."User"("last_login");

-- CreateIndex
CREATE INDEX "idx_user_status_deleted" ON "public"."User"("status", "isDeleted");

-- CreateIndex
CREATE INDEX "idx_user_region_status" ON "public"."User"("region_id", "status");

-- CreateIndex
CREATE INDEX "idx_user_profile_company_id" ON "public"."UserProfile"("companyId");

-- CreateIndex
CREATE INDEX "idx_user_role_user_id" ON "public"."UserRole"("userId");

-- CreateIndex
CREATE INDEX "idx_user_role_role_id" ON "public"."UserRole"("roleId");

-- CreateIndex
CREATE INDEX "idx_user_role_assigned_by" ON "public"."UserRole"("assignedBy");
