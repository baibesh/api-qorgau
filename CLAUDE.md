# API QORGAU - Backend (NestJS + Prisma + PostgreSQL)

## 🎯 Основная информация
- **Фреймворк**: NestJS 11
- **БД**: PostgreSQL через Prisma ORM
- **Порт**: 3333
- **API Prefix**: `/api`
- **Swagger**: `/api/docs` (только development)

## 📁 Структура проекта

```
api-qorgau/
├── prisma/
│   ├── schema.prisma         # Основная схема БД (см. анализ выше)
│   ├── migrations/           # Миграции БД
│   └── seed.ts              # Seed данные
├── src/
│   ├── auth/                # Аутентификация (JWT)
│   ├── user/                # Пользователи
│   ├── role/                # RBAC: роли
│   ├── permission/          # RBAC: права
│   ├── company/             # Компании
│   ├── region/              # Регионы
│   ├── projects/            # Проекты
│   ├── project-status/      # Статусы проектов
│   ├── project-log/         # Логи изменений проектов
│   ├── project-comment/     # Комментарии к проектам
│   ├── kanban-board/        # Канбан доски
│   ├── kanban-column/       # Колонки канбана
│   ├── files/               # Файлы (загрузка)
│   ├── common/              # Общие guards, decorators, exceptions
│   ├── prisma/              # PrismaService
│   └── main.ts              # Точка входа
├── storage/                 # Хранилище файлов
└── ecosystem.config.js      # PM2 конфигурация
```

## 🔐 Аутентификация и авторизация

### JWT Strategy (`src/auth/jwt.strategy.ts`)
- Извлечение токена из: `Authorization: Bearer` или cookie `access_token`
- Payload JWT включает:
  ```ts
  {
    sub: userId,           // ID пользователя
    companyId: number|null, // ID компании (может быть null)
    scope: "GLOBAL"|"COMPANY", // Тип доступа
    roles: string[],       // Массив имён ролей
    aclVersion: number     // Версия ACL для кеша
  }
  ```

### Guards
- **JwtAuthGuard** (`src/auth/jwt-auth.guard.ts`) - проверка валидности JWT
- **PermissionsGuard** (`src/common/guards/permissions.guard.ts`) - проверка прав доступа
  - Проверяет наличие требуемых permissions у пользователя через роли
  - Админы (isAdmin=true) пропускаются автоматически
  - Запрос в БД: User → UserRole → Role → RolePermission → Permission

### Декораторы
- `@RequirePermissions('permission-name')` - требует конкретное право
- Находятся в `src/common/decorators/`

## 📦 Основные модули

### Auth (`src/auth/`)
- `POST /api/auth/login` - вход (возвращает JWT в cookie)
- `POST /api/auth/logout` - выход
- `POST /api/auth/refresh` - обновление access token через refresh token
- `GET /api/auth/permissions` - получить права текущего пользователя
  - **DTO**: `PermissionsResponseDto` (scope, roles, permissions, aclVersion)

### User (`src/user/`)
- CRUD операции с пользователями
- UserProfile связан с Company через `companyId`

### Role & Permission (`src/role/`, `src/permission/`)
- Управление ролями и правами
- Связь M2M: Role ↔ Permission через RolePermission
- Связь M2M: User ↔ Role через UserRole

### Company (`src/company/`)
- Модель Company с типами: PROJECT | CUSTOMER
- Связь с User через UserProfile.companyId
- RegistrationInvitation поддерживает companyId

### Projects (`src/projects/`)
- Управление проектами
- Связь с Region, Company, ProjectStatus, KanbanColumn
- Исполнители (executors) - M2M с User
- Логирование изменений через ProjectLog
- Комментарии через ProjectComment

### Kanban (`src/kanban-board/`, `src/kanban-column/`)
- Доски с колонками (позиционирование)
- Проекты привязаны к колонкам
- KanbanBoardMember - участники доски

### Files (`src/files/`)
- Загрузка файлов (multer)
- Хранилище: `./storage/`

## 🗄️ База данных (Prisma)

### Ключевые модели
- **User**: email, password_hash, refreshToken, isAdmin, status, regionId
- **Role**: name, description (связь с permissions)
- **Permission**: name, description
- **UserRole**: userId + roleId + assignedBy (M2M)
- **RolePermission**: roleId + permissionId + grantedBy (M2M)
- **Company**: name, inn, type, regionId, createdBy, approvedBy
- **UserProfile**: userId (unique) + companyId (nullable) + position
- **RegistrationInvitation**: email, code, roleId, companyId, status, expires_at
- **Project**: name, regionId, statusId, companyId, executors[], kanbanColumnId
- **KanbanBoard/Column**: доски и колонки с позициями
- **Notification**: userId, type, title, message, entityType, entityId, isRead, createdBy
- **NotificationSettings**: userId, soundEnabled, soundVolume, настройки типов уведомлений

### Индексы
Все основные связи имеют индексы (см. `prisma/schema.prisma`)

## 🚀 Команды

```bash
npm run start:dev           # Разработка с hot-reload
npm run build               # Сборка для production
npm run start:prod          # Запуск production

npm run prisma:generate     # Генерация Prisma Client
npm run prisma:migrate:dev  # Создание миграции
npm run prisma:migrate:deploy # Применение миграций
npm run prisma:studio       # Prisma Studio UI
npm run db:seed             # Заполнение БД seed данными

npm run deploy              # Полный деплой (install + migrate + build + seed + pm2)
```

## ⚠️ Проблемы текущей схемы (см. анализ выше)

1. **Нет aclVersion в User** - невозможна инвалидация кеша Redis
2. **UserRole без companyId** - роли глобальные, нельзя назначить разные роли в разных компаниях
3. **User → Company связь 1:1** через UserProfile - нет мультиарендности
4. **Нет механизма деактивации в компании** - только глобальный User.status
5. **Scope вычисляется динамически** - нет явного поля

## 📝 TODO для MVP (из глобального CLAUDE.md)

1. Добавить `User.aclVersion: Int @default(1)`
2. Добавить `UserRole.companyId: Int?` + изменить unique constraint
3. Реализовать `GET /api/auth/permissions` с полным ответом (companyId, scope, roles, aclVersion)
4. Реализовать роуты компании:
   - `GET /companies/:id/users`
   - `POST /companies/:id/invitations`
   - `POST /companies/:id/users/:userId/deactivate`
5. Реализовать кеширование прав в Redis: `user:{id}:acl:{aclVersion}`

## 🔧 Технологии

- NestJS (DI, Decorators, Guards, Pipes)
- Prisma (ORM, Migrations, Type-safe queries)
- Passport JWT (стратегия аутентификации)
- class-validator & class-transformer (валидация DTO)
- bcrypt (хеширование паролей)
- cookie-parser (работа с cookies)
- multer (загрузка файлов)
- Swagger (документация API)
