import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertPermissionsCompanyScope() {
  console.log('Adding company-scoped permissions...');
  const companyPermissions = [
    {
      name: 'company-users:list',
      description: 'Просмотр списка пользователей компании',
    },
    {
      name: 'company-users:read',
      description: 'Просмотр пользователя компании',
    },
    {
      name: 'company-users:invite',
      description: 'Приглашение пользователя в компанию',
    },
    {
      name: 'company-users:deactivate',
      description: 'Деактивация пользователя компании',
    },
    {
      name: 'company-users:assign-role',
      description: 'Назначение роли пользователю компании',
    },

    {
      name: 'company-profile:update',
      description: 'Обновление профиля компании',
    },

    {
      name: 'company-projects:list',
      description: 'Просмотр списка проектов компании',
    },
    { name: 'company-projects:read', description: 'Просмотр проекта компании' },
    {
      name: 'company-projects:create',
      description: 'Создание проекта компании',
    },
    {
      name: 'company-projects:update',
      description: 'Обновление проекта компании',
    },
    {
      name: 'company-projects:archive',
      description: 'Архивирование проекта компании',
    },

    {
      name: 'self-profile:update',
      description: 'Обновление собственного профиля',
    },
  ];

  await prisma.permission.createMany({
    data: companyPermissions,
    skipDuplicates: true,
  });
}

async function upsertRoles(adminUserId: number) {
  console.log('Upserting roles...');

  // Note: Role.createdBy is Int?, not a relation, so we use the scalar field
  await prisma.role.upsert({
    where: { name: 'COMPANY_ADMIN' },
    update: {},
    create: {
      name: 'COMPANY_ADMIN',
      description: 'Администратор компании',
      createdBy: adminUserId,
    },
  });

  await prisma.role.upsert({
    where: { name: 'COMPANY_USER' },
    update: {},
    create: {
      name: 'COMPANY_USER',
      description: 'Пользователь компании',
      createdBy: adminUserId,
    },
  });
}

async function linkRolePermissions(grantedByUserId: number) {
  console.log('Linking roles with permissions...');

  // Get role IDs
  const companyAdminRole = await prisma.role.findUnique({
    where: { name: 'COMPANY_ADMIN' },
  });
  const companyUserRole = await prisma.role.findUnique({
    where: { name: 'COMPANY_USER' },
  });

  if (!companyAdminRole || !companyUserRole) {
    throw new Error('Roles not found');
  }

  // COMPANY_ADMIN permissions: all company-* + self-profile:update
  const companyAdminPermissionNames = [
    'company-users:list',
    'company-users:read',
    'company-users:invite',
    'company-users:deactivate',
    'company-users:assign-role',
    'company-profile:update',
    'company-projects:list',
    'company-projects:read',
    'company-projects:create',
    'company-projects:update',
    'company-projects:archive',
    'self-profile:update',
  ];

  const companyAdminPermissions = await prisma.permission.findMany({
    where: { name: { in: companyAdminPermissionNames } },
  });

  for (const permission of companyAdminPermissions) {
    const existing = await prisma.rolePermission.findFirst({
      where: {
        roleId: companyAdminRole.id,
        permissionId: permission.id,
      },
    });

    if (!existing) {
      await prisma.rolePermission.create({
        data: {
          roleId: companyAdminRole.id,
          permissionId: permission.id,
          grantedBy: grantedByUserId,
        },
      });
    }
  }

  // COMPANY_USER permissions
  const companyUserPermissionNames = [
    'self-profile:update',
    'company-projects:list',
    'company-projects:read',
    'company-projects:create',
    'company-projects:update',
  ];

  const companyUserPermissions = await prisma.permission.findMany({
    where: { name: { in: companyUserPermissionNames } },
  });

  for (const permission of companyUserPermissions) {
    const existing = await prisma.rolePermission.findFirst({
      where: {
        roleId: companyUserRole.id,
        permissionId: permission.id,
      },
    });

    if (!existing) {
      await prisma.rolePermission.create({
        data: {
          roleId: companyUserRole.id,
          permissionId: permission.id,
          grantedBy: grantedByUserId,
        },
      });
    }
  }
}

async function upsertProjectStatuses() {
  console.log('Upserting project statuses...');

  const statuses = [
    { name: 'Новый', description: 'Новый проект' },
    { name: 'В работе', description: 'Проект в работе' },
    { name: 'На согласовании', description: 'Проект на согласовании' },
    { name: 'Закрыт', description: 'Проект закрыт' },
  ];

  for (const status of statuses) {
    const existing = await prisma.projectStatus.findFirst({
      where: { name: status.name },
    });

    if (existing) {
      await prisma.projectStatus.update({
        where: { id: existing.id },
        data: { description: status.description },
      });
    } else {
      await prisma.projectStatus.create({
        data: status,
      });
    }
  }
}

async function upsertProjectCompany(adminUserId: number, regionId: number) {
  console.log('Upserting demo project company...');

  const company = await prisma.company.upsert({
    where: { name: 'Demo Project Company' },
    update: {},
    create: {
      name: 'Demo Project Company',
      description: 'Демонстрационная проектная компания',
      type: 'PROJECT',
      region: { connect: { id: regionId } },
      createdBy: { connect: { id: adminUserId } },
      approvedBy: { connect: { id: adminUserId } },
      approvedAt: new Date(),
      addedVia: 'MANUAL',
    },
  });

  return company;
}

async function upsertCustomerCompany(adminUserId: number, regionId: number) {
  console.log('Upserting demo customer company...');

  const company = await prisma.company.upsert({
    where: { name: 'Demo Customer Company' },
    update: {},
    create: {
      name: 'Demo Customer Company',
      description: 'Демонстрационная компания-заказчик',
      type: 'CUSTOMER',
      region: { connect: { id: regionId } },
      createdBy: { connect: { id: adminUserId } },
      approvedBy: { connect: { id: adminUserId } },
      approvedAt: new Date(),
      addedVia: 'MANUAL',
    },
  });

  return company;
}

async function upsertProjectCompanyAdminUser(
  companyId: number,
  regionId: number,
  assignedBy: number,
) {
  console.log('Creating company admin user...');

  const hashedPassword = await bcrypt.hash('Qqwerty1!', 10);

  const pcAdminUser = await prisma.user.upsert({
    where: { email: 'pc-admin@qorgau.kz' },
    update: {},
    create: {
      email: 'pc-admin@qorgau.kz',
      password_hash: hashedPassword,
      full_name: 'Администратор Компании',
      isAdmin: false,
      status: 'ACTIVE',
      phone: '+7 (777) 234-56-78',
      region_id: regionId,
      created_by: assignedBy,
    },
  });

  // Create or update profile
  await prisma.userProfile.upsert({
    where: { userId: pcAdminUser.id },
    update: { companyId: companyId },
    create: {
      userId: pcAdminUser.id,
      companyId: companyId,
      position: 'Администратор',
    },
  });

  // Assign COMPANY_ADMIN role
  const companyAdminRole = await prisma.role.findUnique({
    where: { name: 'COMPANY_ADMIN' },
  });

  if (companyAdminRole) {
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: pcAdminUser.id,
        roleId: companyAdminRole.id,
      },
    });

    if (!existingRole) {
      await prisma.userRole.create({
        data: {
          userId: pcAdminUser.id,
          roleId: companyAdminRole.id,
          assignedBy: assignedBy,
        },
      });
    }
  }

  return pcAdminUser;
}

async function upsertCompanyInvitation(
  companyId: number,
  roleId: number,
  invitedBy: number,
) {
  console.log('Creating company invitation...');

  // Use fixed code for idempotent seeding
  const code = 'DEMO-COMPANY-INVITE';

  // Delete existing invitation with same email to avoid duplicates
  await prisma.registrationInvitation.deleteMany({
    where: { email: 'demo-user@example.com' },
  });

  await prisma.registrationInvitation.create({
    data: {
      email: 'demo-user@example.com',
      code,
      status: 'PENDING',
      invited_by: invitedBy,
      role_id: roleId,
      companyId: companyId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
}

async function upsertBoardMembership(boardId: number, userId: number) {
  console.log('Adding board membership for company admin...');

  const existing = await prisma.kanbanBoardMember.findFirst({
    where: {
      boardId: boardId,
      userId: userId,
    },
  });

  if (!existing) {
    await prisma.kanbanBoardMember.create({
      data: {
        boardId: boardId,
        userId: userId,
      },
    });
  }
}

async function upsertCentralKanban() {
  const code = 'central-board';
  const name = 'Центральная Канбан';

  // Upsert the board by unique code
  const board = await prisma.kanbanBoard.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  });

  const columns: { name: string; color: string; position: number }[] = [
    { name: 'На просчёте', color: '#9E9E9E', position: 1 },
    { name: 'Подготовка КП / Согласование', color: '#03A9F4', position: 2 },
    { name: 'Договор / Счёт', color: '#2196F3', position: 3 },
    { name: 'Заказ материала', color: '#4CAF50', position: 4 },
    { name: 'Выполнение работ', color: '#FFC107', position: 5 },
    { name: 'Сдача объекта / Документы', color: '#FF9800', position: 6 },
    { name: 'Оплата', color: '#009688', position: 7 },
    { name: 'Закрыто / Архив', color: '#BDBDBD', position: 8 },
  ];

  // Ensure each column exists with the latest attributes.
  for (const col of columns) {
    const existing = await prisma.kanbanColumn.findFirst({
      where: { boardId: board.id, name: col.name },
    });

    if (existing) {
      await prisma.kanbanColumn.update({
        where: { id: existing.id },
        data: { position: col.position, color: col.color },
      });
    } else {
      await prisma.kanbanColumn.create({
        data: {
          boardId: board.id,
          name: col.name,
          position: col.position,
          color: col.color,
        },
      });
    }
  }

  return board;
}

async function seedRegionsPermissionsAndAdmin() {
  // eslint-disable-next-line no-console
  console.log('Starting seed...');

  // Create regions
  const regions = [
    { name: 'Алматы' },
    { name: 'Нур-Султан' },
    { name: 'Шымкент' },
    { name: 'Алматинская область' },
    { name: 'Акмолинская область' },
    { name: 'Актюбинская область' },
    { name: 'Атырауская область' },
    { name: 'Восточно-Казахстанская область' },
    { name: 'Жамбылская область' },
    { name: 'Западно-Казахстанская область' },
    { name: 'Карагандинская область' },
    { name: 'Костанайская область' },
    { name: 'Кызылординская область' },
    { name: 'Мангистауская область' },
    { name: 'Павлодарская область' },
    { name: 'Северо-Казахстанская область' },
    { name: 'Туркестанская область' },
  ];

  // eslint-disable-next-line no-console
  console.log('Creating regions...');
  for (const regionData of regions) {
    await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: regionData,
    });
  }

  // Seed permissions
  // eslint-disable-next-line no-console
  console.log('Seeding permissions...');
  /* eslint-disable prettier/prettier */
  const permissions = [
    { name: 'users:list', description: 'Просмотр списка пользователей' },
    { name: 'users:read', description: 'Просмотр пользователя' },
    { name: 'users:create', description: 'Создание пользователя' },
    { name: 'users:update', description: 'Обновление пользователя' },
    { name: 'users:delete', description: 'Удаление пользователя' },

    { name: 'roles:list', description: 'Просмотр списка ролей' },
    { name: 'roles:read', description: 'Просмотр роли' },
    { name: 'roles:create', description: 'Создание роли' },
    { name: 'roles:update', description: 'Обновление роли' },
    { name: 'roles:delete', description: 'Удаление роли' },

    { name: 'permissions:list', description: 'Просмотр списка разрешений' },
    { name: 'permissions:read', description: 'Просмотр разрешения' },
    { name: 'permissions:create', description: 'Создание разрешения' },
    { name: 'permissions:update', description: 'Обновление разрешения' },
    { name: 'permissions:delete', description: 'Удаление разрешения' },

    { name: 'projects:list', description: 'Просмотр списка проектов' },
    { name: 'projects:read', description: 'Просмотр проекта' },
    { name: 'projects:create', description: 'Создание проекта' },
    { name: 'projects:update', description: 'Обновление проекта' },
    { name: 'projects:delete', description: 'Удаление проекта' },
    {
      name: 'projects:move',
      description: 'Перемещение проекта между колонками',
    },
    {
      name: 'projects:status:update',
      description: 'Обновление статуса проекта',
    },

    { name: 'kanban-boards:list', description: 'Просмотр списка канбан-досок' },
    { name: 'kanban-boards:read', description: 'Просмотр канбан-доски' },
    { name: 'kanban-boards:create', description: 'Создание канбан-доски' },
    { name: 'kanban-boards:update', description: 'Обновление канбан-доски' },
    { name: 'kanban-boards:delete', description: 'Удаление канбан-доски' },
    {
      name: 'kanban-boards:members:add',
      description: 'Добавление участника в канбан-доску',
    },
    {
      name: 'kanban-boards:members:list',
      description: 'Просмотр участников канбан-доски',
    },
    {
      name: 'kanban-boards:members:remove',
      description: 'Удаление участника из канбан-доски',
    },
    {
      name: 'kanban-boards:join',
      description: 'Присоединение к канбан-доске по коду',
    },
    {
      name: 'kanban-boards:projects:list',
      description: 'Просмотр проектов доски, сгруппированных по колонкам',
    },

    {
      name: 'kanban-columns:list',
      description: 'Просмотр колонок канбан-доски',
    },
    { name: 'kanban-columns:create', description: 'Создание колонки' },
    { name: 'kanban-columns:update', description: 'Обновление колонки' },
    {
      name: 'kanban-columns:reorder',
      description: 'Изменение порядка колонок',
    },

    {
      name: 'project-comments:list',
      description: 'Просмотр комментариев проекта',
    },
    {
      name: 'project-comments:create',
      description: 'Добавление комментария к проекту',
    },

    {
      name: 'project-logs:list',
      description: 'Просмотр истории изменений проекта',
    },

    {
      name: 'project-statuses:list',
      description: 'Просмотр списка статусов проекта',
    },
    { name: 'project-statuses:read', description: 'Просмотр статуса проекта' },
    {
      name: 'project-statuses:create',
      description: 'Создание статуса проекта',
    },
    {
      name: 'project-statuses:update',
      description: 'Обновление статуса проекта',
    },
    {
      name: 'project-statuses:delete',
      description: 'Удаление статуса проекта',
    },

    {
      name: 'project-types:list',
      description: 'Просмотр списка типов проекта',
    },
    { name: 'project-types:read', description: 'Просмотр типа проекта' },
    { name: 'project-types:create', description: 'Создание типа проекта' },
    { name: 'project-types:update', description: 'Обновление типа проекта' },
    { name: 'project-types:delete', description: 'Удаление типа проекта' },

    { name: 'companies:list', description: 'Просмотр списка компаний' },
    { name: 'companies:read', description: 'Просмотр компании' },
    { name: 'companies:create', description: 'Создание компании' },
    { name: 'companies:update', description: 'Обновление компании' },
    { name: 'companies:delete', description: 'Удаление компании' },

    { name: 'regions:list', description: 'Просмотр списка регионов' },
    { name: 'regions:read', description: 'Просмотр региона' },
    { name: 'regions:create', description: 'Создание региона' },
    { name: 'regions:update', description: 'Обновление региона' },
    { name: 'regions:delete', description: 'Удаление региона' },
  ];

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true,
  });

  // Add company-scoped permissions
  await upsertPermissionsCompanyScope();

  // Get the first region for the admin user
  const firstRegion = await prisma.region.findFirst();

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Qqwerty1!', 10);

  // Create admin user
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qorgau.kz' },
    update: {},
    create: {
      email: 'admin@qorgau.kz',
      password_hash: hashedPassword,
      full_name: 'Администратор Системы',
      isAdmin: true,
      status: 'ACTIVE',
      phone: '+7 (777) 123-45-67',
      region_id: firstRegion?.id || null,
    },
  });

  console.log('Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
    isAdmin: adminUser.isAdmin,
  });

  // Upsert roles
  await upsertRoles(adminUser.id);

  // Link role permissions
  await linkRolePermissions(adminUser.id);

  // Upsert project statuses
  await upsertProjectStatuses();

  // Upsert central kanban
  const centralBoard = await upsertCentralKanban();

  // Upsert project company
  const projectCompany = await upsertProjectCompany(
    adminUser.id,
    firstRegion?.id || 1,
  );

  // Upsert customer company
  await upsertCustomerCompany(adminUser.id, firstRegion?.id || 1);

  // Create company admin user
  const companyAdmin = await upsertProjectCompanyAdminUser(
    projectCompany.id,
    firstRegion?.id || 1,
    adminUser.id,
  );

  // Create company invitation (optional)
  const companyUserRole = await prisma.role.findUnique({
    where: { name: 'COMPANY_USER' },
  });

  if (companyUserRole) {
    await upsertCompanyInvitation(
      projectCompany.id,
      companyUserRole.id,
      adminUser.id,
    );
  }

  // Add board membership for company admin
  await upsertBoardMembership(centralBoard.id, companyAdmin.id);

  console.log('Seed completed successfully!');
}

async function main() {
  await seedRegionsPermissionsAndAdmin();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
