# E-Invoice Application

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="60" alt="NestJS Logo" /></a>
  <a href="https://nx.dev" target="_blank"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="60" alt="Nx Logo" /></a>
</p>

<p align="center">
  A modern, scalable e-invoice management system built with NestJS and Nx Monorepo architecture.
</p>

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Applications](#running-the-applications)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)

## 🎯 Overview

This is an enterprise-grade e-invoice application that provides comprehensive invoice management capabilities. The system is designed using a microservices architecture pattern with the following key features:

- **Invoice Management**: Create, read, update, and delete invoices
- **Product Management**: Manage product catalog for invoices
- **User Management**: Handle user authentication and authorization
- **Keycloak Integration**: Secure authentication using Keycloak identity provider
- **Role-Based Access Control**: Fine-grained permission management

## 🏗️ Architecture

The application follows a **Backend for Frontend (BFF)** pattern with microservices architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Applications                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BFF (Backend for Frontend)                    │
│                         Port: 3300                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   Invoice   │ │   Product   │ │    User     │ │ Authorizer │ │
│  │   Module    │ │   Module    │ │   Module    │ │   Module   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                │               │               │
         │ TCP            │ TCP           │ TCP           │ gRPC/TCP
         ▼                ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Invoice    │  │   Product    │  │    User      │  │  Authorizer  │
│   Service    │  │   Service    │  │   Service    │  │   Service    │
│  Port: 3001  │  │  Port: 3002  │  │  Port: 3003  │  │  Port: 3004  │
│  TCP: 3201   │  │  TCP: 3202   │  │  TCP: 3203   │  │  TCP: 3204   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
         │                │               │               │
         ▼                ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐ │
│  │  MongoDB  │  │ PostgreSQL│  │   Redis   │  │   Keycloak    │ │
│  │  :27017   │  │   :5433   │  │   :6379   │  │    :8180      │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Patterns

- **HTTP/REST**: External client communication with BFF
- **TCP**: Inter-service communication for synchronous requests
- **gRPC**: High-performance communication for Authorizer service

## 🛠️ Tech Stack

### Core Framework

- **[NestJS](https://nestjs.com/)** v11 - Progressive Node.js framework
- **[Nx](https://nx.dev/)** v22 - Smart monorepo build system
- **[TypeScript](https://www.typescriptlang.org/)** v5.9 - Type-safe JavaScript

### Databases

- **[MongoDB](https://www.mongodb.com/)** v6 - NoSQL database for invoices
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Redis](https://redis.io/)** - Caching and rate limiting

### Authentication & Security

- **[Keycloak](https://www.keycloak.org/)** v25 - Identity and access management
- **JWT** - Token-based authentication
- **JWKS-RSA** - JSON Web Key Set validation

### Communication

- **[@nestjs/microservices](https://docs.nestjs.com/microservices/basics)** - Microservices support
- **[@grpc/grpc-js](https://grpc.io/)** - gRPC communication
- **TCP Transport** - Internal service communication

### Development Tools

- **[SWC](https://swc.rs/)** - Fast TypeScript/JavaScript compiler
- **[Webpack](https://webpack.js.org/)** - Module bundler
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Jest](https://jestjs.io/)** - Testing framework

## 📁 Project Structure

```
my-workspace/
├── apps/                          # Application projects
│   ├── bff/                       # Backend for Frontend (API Gateway)
│   │   └── src/
│   │       ├── app/
│   │       │   └── modules/
│   │       │       ├── authorizer/    # Auth proxy module
│   │       │       ├── invoice/       # Invoice proxy module
│   │       │       ├── product/       # Product proxy module
│   │       │       └── user/          # User proxy module
│   │       └── configuration/
│   │
│   ├── invoice/                   # Invoice microservice
│   │   └── src/
│   │       └── app/
│   │           └── modules/
│   │               └── invoice/
│   │                   ├── controllers/
│   │                   ├── services/
│   │                   ├── repositories/
│   │                   └── mappers/
│   │
│   ├── authorizer/                # Authorization microservice
│   │   └── src/
│   │       └── app/
│   │           └── modules/
│   │               ├── authorizer/
│   │               └── keycloak/
│   │
│   ├── bff-e2e/                   # BFF end-to-end tests
│   └── invoice-e2e/               # Invoice service e2e tests
│
├── libs/                          # Shared libraries
│   ├── configuration/             # Shared configuration
│   │   └── src/lib/
│   │       ├── app.config.ts
│   │       ├── grpc.config.ts
│   │       ├── mongo.config.ts
│   │       ├── redis.config.ts
│   │       ├── tcp.config.ts
│   │       └── throttler.config.ts
│   │
│   ├── constants/                 # Shared constants & enums
│   │   └── src/lib/
│   │       ├── common.constant.ts
│   │       └── enum/
│   │           ├── error-code.enum.ts
│   │           ├── http-message.enum.ts
│   │           ├── invoice.enum.ts
│   │           └── role.enum.ts
│   │
│   ├── decorators/                # Custom decorators
│   │   └── src/lib/
│   │       ├── authorizer.decorator.ts
│   │       ├── permission.decorator.ts
│   │       └── user-data.decorator.ts
│   │
│   ├── entities/                  # TypeORM entities
│   │   └── src/lib/
│   │       ├── base.entity.ts
│   │       └── product.entity.ts
│   │
│   ├── guards/                    # Authentication guards
│   │   └── src/lib/
│   │       ├── permission.guard.ts
│   │       └── user.guard.ts
│   │
│   ├── interceptors/              # Request/Response interceptors
│   │   └── src/lib/
│   │       ├── exception.interceptor.ts
│   │       └── tcpLogging.interceptor.ts
│   │
│   ├── interfaces/                # Shared interfaces & DTOs
│   │   └── src/lib/
│   │       ├── gateway/           # REST API DTOs
│   │       ├── tcp/               # TCP message interfaces
│   │       └── proto/             # gRPC protocol buffers
│   │
│   ├── middlewares/               # Express middlewares
│   │   └── src/lib/
│   │       └── logger.middleware.ts
│   │
│   ├── schemas/                   # Mongoose schemas
│   │   └── src/lib/
│   │       ├── base.schema.ts
│   │       ├── invoice.schema.ts
│   │       ├── role.schema.ts
│   │       └── user.schema.ts
│   │
│   └── utils/                     # Utility functions
│       └── src/lib/
│           ├── request.utils.ts
│           └── string.utils.ts
│
├── docker/                        # Docker data volumes
├── .github/                       # GitHub workflows
├── .husky/                        # Git hooks
├── docker-compose.provider.yaml   # Infrastructure services
├── nx.json                        # Nx configuration
├── package.json                   # Dependencies
└── tsconfig.base.json            # TypeScript base config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x (recommended package manager)
- **Docker** & **Docker Compose** (for infrastructure services)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-workspace
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start infrastructure services**

   ```bash
   docker compose -f docker-compose.provider.yaml up -d
   ```

4. **Configure environment**
   - Copy `.env` file and adjust values if needed
   - Set up Keycloak realm and client (see [Keycloak Setup](#keycloak-setup))

## ⚙️ Configuration

### Environment Variables

| Variable                       | Default                                 | Description                  |
| ------------------------------ | --------------------------------------- | ---------------------------- |
| `PORT`                         | 3300                                    | BFF service port             |
| `GLOBAL_PREFIX`                | api/v1                                  | API route prefix             |
| `INVOICE_PORT`                 | 3001                                    | Invoice service HTTP port    |
| `PRODUCT_PORT`                 | 3002                                    | Product service HTTP port    |
| `USER_ACCESS_PORT`             | 3003                                    | User service HTTP port       |
| `AUTHORIZER_PORT`              | 3004                                    | Authorizer service HTTP port |
| `TCP_INVOICE_SERVICE_PORT`     | 3201                                    | Invoice service TCP port     |
| `TCP_PRODUCT_SERVICE_PORT`     | 3202                                    | Product service TCP port     |
| `TCP_USER_ACCESS_SERVICE_PORT` | 3203                                    | User service TCP port        |
| `TCP_AUTHORIZER_SERVICE_PORT`  | 3204                                    | Authorizer service TCP port  |
| `REDIS_HOST`                   | localhost                               | Redis server host            |
| `REDIS_PORT`                   | 6379                                    | Redis server port            |
| `REDIS_TTL`                    | 1800000                                 | Cache TTL (30 minutes)       |
| `MONGO_URI`                    | mongodb://root:example@localhost:27017/ | MongoDB connection string    |
| `MONGO_DB_NAME`                | invoice_app                             | MongoDB database name        |
| `KEYCLOAK_HOST`                | http://localhost:8180                   | Keycloak server URL          |
| `KEYCLOAK_REALM`               | einvoice-app                            | Keycloak realm name          |
| `KEYCLOAK_CLIENT_ID`           | einvoice-app                            | Keycloak client ID           |
| `KEYCLOAK_CLIENT_SECRET`       | -                                       | Keycloak client secret       |

### Infrastructure Services

The `docker-compose.provider.yaml` provides:

| Service       | Port  | Description         |
| ------------- | ----- | ------------------- |
| MongoDB       | 27017 | Document database   |
| PostgreSQL    | 5433  | Relational database |
| pgAdmin       | 5050  | PostgreSQL admin UI |
| Redis         | 6379  | Caching server      |
| Redis Insight | 5540  | Redis admin UI      |
| Keycloak      | 8180  | Identity provider   |

## 🏃 Running the Applications

### Development Mode

**Run all services:**

```bash
pnpm dev
```

**Run only BFF (API Gateway):**

```bash
pnpm dev-bff
```

**Run individual services:**

```bash
# Invoice service
npx nx serve invoice

# Authorizer service
npx nx serve authorizer

# BFF service
npx nx serve bff
```

### Production Build

```bash
# Build all applications
npx nx run-many -t build

# Build specific application
npx nx build invoice
npx nx build bff
```

## 📖 API Documentation

Swagger API documentation is available at:

- **BFF**: `http://localhost:3300/api/v1/docs`

The API follows RESTful conventions with the following main endpoints:

### Invoice Endpoints

- `GET /api/v1/invoices` - List all invoices
- `GET /api/v1/invoices/:id` - Get invoice by ID
- `POST /api/v1/invoices` - Create new invoice
- `PUT /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice

### Product Endpoints

- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create new product

### User Endpoints

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/me` - Get current user

### Authorization Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

## 💻 Development

### Code Generation

**Generate a new NestJS application:**

```bash
npx nx g @nx/nest:app <app-name>
```

**Generate a new library:**

```bash
npx nx g @nx/node:lib <lib-name>
```

**Generate NestJS resources:**

```bash
# Module
npx nx g @nx/nest:module <module-name> --project=<app-name>

# Controller
npx nx g @nx/nest:controller <controller-name> --project=<app-name>

# Service
npx nx g @nx/nest:service <service-name> --project=<app-name>
```

### Linting

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint invoice
```

### Code Formatting

```bash
# Format all files
pnpm prettier --write "**/*.{ts,js,json,md}"
```

### Project Graph

Visualize project dependencies:

```bash
npx nx graph
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npx nx run-many -t test

# Run tests for specific project
npx nx test invoice

# Run tests with coverage
npx nx test invoice --coverage
```

### End-to-End Tests

```bash
# Run e2e tests
npx nx e2e bff-e2e
npx nx e2e invoice-e2e
```

## 📝 Keycloak Setup

1. Access Keycloak Admin Console at `http://localhost:8180`
2. Login with credentials: `admin` / `admin`
3. Create a new realm: `einvoice-app`
4. Create a new client: `einvoice-app`
   - Client authentication: ON
   - Authorization: ON
5. Configure client roles and permissions as needed

## 🔧 Troubleshooting

### Reset Nx Cache

```bash
pnpm nx:reset
```

### Docker Services

```bash
# View logs
docker compose -f docker-compose.provider.yaml logs -f

# Restart services
docker compose -f docker-compose.provider.yaml restart

# Clean up
docker compose -f docker-compose.provider.yaml down -v
```

## 📄 License

This project is [MIT licensed](LICENSE).

---

<p align="center">
  Built with ❤️ using NestJS and Nx
</p>
