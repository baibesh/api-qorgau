# Project Guidelines

## Architecture
- Модульная NestJS архитектура: для каждой сущности (Region, ProjectStatus, ProjectType) — модуль, сервис, контроллер.
- Сервисы отвечают за бизнес-логику, контроллеры — минимальны.

## Database
- Используется ORM Prisma.
- PrismaService используется для доступа к PrismaClient.
- Модели в `prisma/schema.prisma`

## Configuration
- Использовать `@nestjs/config`.
- DATABASE_URL хранится в `.env`.
- Не использовать жестко заданные параметры подключения.

## Testing
- Тестовые файлы `*.spec.ts` *не генерировать*.
- Не писать юнит‑ или e2e‑тесты.

## Code Style
- DTOs для всех запросов и ответов.
- class-validator в DTO (`@IsString`, `@IsOptional`).
- Errors через NestJS исключения.
- Логирование через NestJS Logger, не через console.log.

## Prisma Rules
- После любого изменения `prisma/schema.prisma` необходимо автоматически запускать: npx prisma generate

## Swagger / OpenAPI
- Использовать Swagger для документирования всех REST API.
- DTO-классы должны быть аннотированы для генерации схемы Swagger.