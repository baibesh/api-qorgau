import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
    { name: 'projects:move', description: 'Перемещение проекта между колонками' },
    { name: 'projects:status:update', description: 'Обновление статуса проекта' },

    { name: 'kanban-boards:list', description: 'Просмотр списка канбан-досок' },
    { name: 'kanban-boards:read', description: 'Просмотр канбан-доски' },
    { name: 'kanban-boards:create', description: 'Создание канбан-доски' },
    { name: 'kanban-boards:update', description: 'Обновление канбан-доски' },
    { name: 'kanban-boards:delete', description: 'Удаление канбан-доски' },
    { name: 'kanban-boards:members:add', description: 'Добавление участника в канбан-доску' },
    { name: 'kanban-boards:members:list', description: 'Просмотр участников канбан-доски' },
    { name: 'kanban-boards:members:remove', description: 'Удаление участника из канбан-доски' },
    { name: 'kanban-boards:join', description: 'Присоединение к канбан-доске по коду' },
    { name: 'kanban-boards:projects:list', description: 'Просмотр проектов доски, сгруппированных по колонкам' },

    { name: 'kanban-columns:list', description: 'Просмотр колонок канбан-доски' },
    { name: 'kanban-columns:create', description: 'Создание колонки' },
    { name: 'kanban-columns:update', description: 'Обновление колонки' },
    { name: 'kanban-columns:reorder', description: 'Изменение порядка колонок' },

    { name: 'project-comments:list', description: 'Просмотр комментариев проекта' },
    { name: 'project-comments:create', description: 'Добавление комментария к проекту' },

    { name: 'project-logs:list', description: 'Просмотр истории изменений проекта' },

    { name: 'project-statuses:list', description: 'Просмотр списка статусов проекта' },
    { name: 'project-statuses:read', description: 'Просмотр статуса проекта' },
    { name: 'project-statuses:create', description: 'Создание статуса проекта' },
    { name: 'project-statuses:update', description: 'Обновление статуса проекта' },
    { name: 'project-statuses:delete', description: 'Удаление статуса проекта' },

    { name: 'project-types:list', description: 'Просмотр списка типов проекта' },
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
  /* eslint-enable prettier/prettier */

  // Get the first region for the admin user
  const firstRegion = await prisma.region.findFirst();

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('Qqwerty1!', 10);

  // Create admin user
  // eslint-disable-next-line no-console
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

  // eslint-disable-next-line no-console
  console.log('Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
    isAdmin: adminUser.isAdmin,
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully!');
}

async function main() {
  await seedRegionsPermissionsAndAdmin();
  await upsertCentralKanban();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
