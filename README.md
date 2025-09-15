# NestJS Microservices: User Service + Audit Service

## Цель

Создание backend-сервиса из двух микросервисов, взаимодействующих через gRPC:

- **User Service** – управление пользователями, HTTP API.
- **Audit Service** – логирование действий пользователей, gRPC сервер, read-only HTTP эндпоинт для просмотра логов.

---

## Описание проекта

Проект реализует два микросервиса с отдельными подключениями к PostgreSQL и взаимодействием через gRPC.  
User Service управляет пользователями и инициирует события аудита в Audit Service. Audit Service сохраняет события в БД и предоставляет HTTP эндпоинт для отладки.

---

## Основные функции микросервисов

## 1. User Service

**HTTP API (порт 3000)**

**Эндпоинты:**

| Метод | Путь | Описание |
|-------|------|----------|
| POST  | `/users` | Создание пользователя |
| GET   | `/users` | Получение списка пользователей с фильтрацией, пагинацией и сортировкой |
| GET   | `/users/:id` | Получение пользователя по ID |
| PATCH | `/users/:id` | Обновление пользователя |
| DELETE| `/users/:id` | Мягкое удаление (soft delete) |
| GET   | `/health/live` | Проверка работы сервиса |
| GET   | `/health/ready` | Проверка подключения к БД и доступности gRPC Audit Service |

**Безопасность и ограничения:**

- API-key через заголовок `X-API-Key`
- Rate-limit: 120 rps на IP

**Примечания:**

- После каждого действия инициируется вызов в Audit Service по gRPC с передачей информации об операции
- Soft-deleted пользователи не участвуют в выборках

---

## 2. Audit Service

**HTTP (порт 5001) + gRPC (порт 50051)**

**gRPC методы:**

| Метод | Описание |
|-------|----------|
| `LogEvent` | Приём событий от User Service |
| `Ping`     | Проверка доступности сервиса |

**HTTP эндпоинт для просмотра логов:**

| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/audit/logs` | Получение событий аудита с фильтрацией и пагинацией |

**Безопасность:**

- API-key через заголовок `X-API-Key`

**Примечания:**

- События записываются в PostgreSQL
- Read-only HTTP эндпоинт предназначен для отладки
- gRPC сервер принимает события от User Service
---

## Технологии

- **NestJS** – основной фреймворк
- **Sequelize ORM** – работа с PostgreSQL
- **PostgreSQL** – отдельные базы для User и Audit сервисов
- **gRPC** – взаимодействие между сервисами
- **class-validator / class-transformer** – валидация DTO
- **Swagger** – документация HTTP API
- **@nestjs/throttler** – rate-limiting
- **UUID** – идентификаторы сущностей
- **API-key** – простая авторизация HTTP эндпоинтов

---

## Настройка

1. Создать файлы `.env` в каждом сервисе и заполнить переменные:

## User Service
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASS=userpass
DB_NAME=user_db
AUDIT_GRPC_URL=localhost:50051
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=120
API_KEY=1234
```

## Audit Service
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5433
DB_USER=audit
DB_PASS=auditpass
DB_NAME=audit_db
AUDIT_GRPC_URL=0.0.0.0:50051
API_KEY=1234
```

2. Запусить БД в docker-compose:

```bash
    docker-compose up -d
```

3. Установить зависимости и запустить сервисы:

```bash
    cd user-service
    npm install
    npm run start:dev
```

```bash
    cd audit-service
    npm install
    npm run start:dev
```

---

## Запуск приложений и доступ к API

### User Service
- **URL:** `http://localhost:3000`
- **Swagger документация:** `http://localhost:3000/api`
- **Health endpoints:**
    - `http://localhost:3000/health/live`
    - `http://localhost:3000/health/ready`

### Audit Service
- **gRPC сервер:** `localhost:50051`
- **HTTP эндпоинт логов:** `http://localhost:5001/audit/logs`
- **Swagger документация:** `http://localhost:5001/api`
