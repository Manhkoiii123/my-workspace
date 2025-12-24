# gRPC - Lý thuyết và Phân biệt với TCP

## Mục lục

- [1. Giới thiệu về gRPC](#1-giới-thiệu-về-grpc)
- [2. Kiến trúc và Nguyên lý hoạt động](#2-kiến-trúc-và-nguyên-lý-hoạt-động)
- [3. Protocol Buffers (Protobuf)](#3-protocol-buffers-protobuf)
- [4. Các loại Communication Patterns](#4-các-loại-communication-patterns)
- [5. TCP vs gRPC - Phân biệt chi tiết](#5-tcp-vs-grpc---phân-biệt-chi-tiết)
- [6. Khi nào sử dụng TCP và gRPC](#6-khi-nào-sử-dụng-tcp-và-grpc)
- [7. gRPC trong Microservices](#7-grpc-trong-microservices)
- [8. Luồng gọi gRPC verifyUserToken trong Project](#8-luồng-gọi-grpc-verifyusertoken-trong-project)
- [9. Tóm tắt gRPC trong Dự án Invoice App](#9-tóm-tắt-grpc-trong-dự-án-invoice-app)

---

## 1. Giới thiệu về gRPC

### 1.1 gRPC là gì?

**gRPC** (gRPC Remote Procedure Call) là một framework RPC mã nguồn mở, hiệu năng cao được phát triển bởi Google. gRPC cho phép các ứng dụng giao tiếp với nhau một cách hiệu quả, bất kể chúng được viết bằng ngôn ngữ lập trình nào.

### 1.2 Đặc điểm chính

- **High Performance**: Sử dụng HTTP/2 và Protocol Buffers để đạt hiệu năng cao
- **Multi-language Support**: Hỗ trợ 10+ ngôn ngữ (Go, Java, Python, C++, Node.js, etc.)
- **Bi-directional Streaming**: Hỗ trợ streaming hai chiều
- **Strong Typing**: Contract-first development với `.proto` files
- **Built-in Features**: Load balancing, tracing, health checking, authentication

### 1.3 Lịch sử phát triển

| Năm  | Sự kiện                                 |
| ---- | --------------------------------------- |
| 2001 | Google phát triển Stubby (internal RPC) |
| 2015 | gRPC được open-source                   |
| 2017 | gRPC trở thành CNCF project             |
| Nay  | Sử dụng rộng rãi trong microservices    |

---

## 2. Kiến trúc và Nguyên lý hoạt động

### 2.1 Stack kiến trúc

```
┌─────────────────────────────────────────────┐
│           Application Code                   │
├─────────────────────────────────────────────┤
│           gRPC Framework                     │
│    (Stubs, Channels, Interceptors)          │
├─────────────────────────────────────────────┤
│           Protocol Buffers                   │
│         (Serialization/Deserialization)      │
├─────────────────────────────────────────────┤
│              HTTP/2                          │
│    (Multiplexing, Flow Control, Compression) │
├─────────────────────────────────────────────┤
│              TLS/SSL                         │
│           (Encryption - Optional)            │
├─────────────────────────────────────────────┤
│               TCP                            │
│        (Reliable Transport Layer)            │
└─────────────────────────────────────────────┘
```

### 2.2 Luồng hoạt động

```
┌──────────┐                              ┌──────────┐
│  Client  │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │  1. Client gọi method trên stub         │
     │─────────────────────────────────────────►
     │                                         │
     │  2. Serialize request (Protobuf)        │
     │─────────────────────────────────────────►
     │                                         │
     │  3. HTTP/2 frame over TCP               │
     │─────────────────────────────────────────►
     │                                         │
     │  4. Server deserialize & process        │
     │                                         │
     │  5. Serialize response (Protobuf)       │
     │◄─────────────────────────────────────────
     │                                         │
     │  6. Client deserialize response         │
     │◄─────────────────────────────────────────
     │                                         │
```

### 2.3 HTTP/2 Features được gRPC tận dụng

| Feature                | Mô tả                            | Lợi ích                           |
| ---------------------- | -------------------------------- | --------------------------------- |
| **Multiplexing**       | Nhiều requests trên 1 connection | Giảm latency, tiết kiệm resources |
| **Header Compression** | HPACK compression                | Giảm bandwidth                    |
| **Binary Protocol**    | Frames thay vì text              | Hiệu năng cao hơn                 |
| **Server Push**        | Server gửi data proactively      | Tối ưu streaming                  |
| **Flow Control**       | Kiểm soát luồng dữ liệu          | Tránh overwhelm                   |

---

## 3. Protocol Buffers (Protobuf)

### 3.1 Protobuf là gì?

Protocol Buffers là ngôn ngữ định nghĩa interface (IDL) và cơ chế serialization của gRPC. Nó định nghĩa cấu trúc dữ liệu và services một cách language-neutral.

### 3.2 Ví dụ .proto file

```protobuf
// user.proto
syntax = "proto3";

package user;

// Service definition
service UserService {
  // Unary RPC
  rpc GetUser(GetUserRequest) returns (User);

  // Server streaming
  rpc ListUsers(ListUsersRequest) returns (stream User);

  // Client streaming
  rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);

  // Bidirectional streaming
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

// Message definitions
message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
  optional string phone = 5;
}

message GetUserRequest {
  int32 id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUsersResponse {
  int32 created_count = 1;
}

message ChatMessage {
  string sender = 1;
  string content = 2;
  int64 timestamp = 3;
}
```

### 3.3 Protobuf vs JSON

| Khía cạnh           | Protocol Buffers  | JSON     |
| ------------------- | ----------------- | -------- |
| **Format**          | Binary            | Text     |
| **Size**            | Nhỏ hơn 3-10x     | Lớn hơn  |
| **Parse Speed**     | Nhanh hơn 20-100x | Chậm hơn |
| **Schema**          | Required (.proto) | Optional |
| **Human Readable**  | Không             | Có       |
| **Browser Support** | Cần gRPC-Web      | Native   |
| **Type Safety**     | Strict            | Loose    |

### 3.4 Scalar Types trong Protobuf

| Proto Type | Go      | Java       | Python | TypeScript |
| ---------- | ------- | ---------- | ------ | ---------- |
| double     | float64 | double     | float  | number     |
| float      | float32 | float      | float  | number     |
| int32      | int32   | int        | int    | number     |
| int64      | int64   | long       | int    | bigint     |
| bool       | bool    | boolean    | bool   | boolean    |
| string     | string  | String     | str    | string     |
| bytes      | []byte  | ByteString | bytes  | Uint8Array |

---

## 4. Các loại Communication Patterns

### 4.1 Unary RPC

```
Client                    Server
   │                         │
   │──── Request ───────────►│
   │                         │
   │◄─── Response ───────────│
   │                         │
```

**Use case**: CRUD operations, authentication, simple queries

```protobuf
rpc GetUser(GetUserRequest) returns (User);
```

### 4.2 Server Streaming RPC

```
Client                    Server
   │                         │
   │──── Request ───────────►│
   │                         │
   │◄─── Response 1 ─────────│
   │◄─── Response 2 ─────────│
   │◄─── Response 3 ─────────│
   │◄─── End Stream ─────────│
   │                         │
```

**Use case**: Real-time updates, large data pagination, log streaming

```protobuf
rpc ListUsers(ListUsersRequest) returns (stream User);
```

### 4.3 Client Streaming RPC

```
Client                    Server
   │                         │
   │──── Request 1 ─────────►│
   │──── Request 2 ─────────►│
   │──── Request 3 ─────────►│
   │──── End Stream ────────►│
   │                         │
   │◄─── Response ───────────│
   │                         │
```

**Use case**: File upload, batch operations, data aggregation

```protobuf
rpc CreateUsers(stream CreateUserRequest) returns (CreateUsersResponse);
```

### 4.4 Bidirectional Streaming RPC

```
Client                    Server
   │                         │
   │──── Request 1 ─────────►│
   │◄─── Response 1 ─────────│
   │──── Request 2 ─────────►│
   │──── Request 3 ─────────►│
   │◄─── Response 2 ─────────│
   │◄─── Response 3 ─────────│
   │──── End Stream ────────►│
   │◄─── End Stream ─────────│
   │                         │
```

**Use case**: Chat applications, real-time collaboration, gaming

```protobuf
rpc Chat(stream ChatMessage) returns (stream ChatMessage);
```

---

## 5. TCP vs gRPC - Phân biệt chi tiết

### 5.1 Vị trí trong OSI Model

```
┌─────────────────────────────────────────────────────────────┐
│                    OSI Model Layers                          │
├──────────────┬──────────────────────┬───────────────────────┤
│    Layer     │        TCP           │        gRPC           │
├──────────────┼──────────────────────┼───────────────────────┤
│ 7. Application│                      │    ✅ gRPC hoạt động  │
│ 6. Presentation│                     │    ✅ Protobuf        │
│ 5. Session   │                      │    ✅ HTTP/2          │
│ 4. Transport │    ✅ TCP hoạt động  │    (sử dụng TCP)      │
│ 3. Network   │    (IP layer)        │                       │
│ 2. Data Link │                      │                       │
│ 1. Physical  │                      │                       │
└──────────────┴──────────────────────┴───────────────────────┘
```

**Quan trọng**: TCP và gRPC KHÔNG phải là hai thứ thay thế nhau. gRPC được xây dựng **trên nền** TCP (thông qua HTTP/2).

### 5.2 So sánh chi tiết

| Tiêu chí                    | Raw TCP Socket            | gRPC                            |
| --------------------------- | ------------------------- | ------------------------------- |
| **Abstraction Level**       | Low-level                 | High-level framework            |
| **Transport**               | Là transport protocol     | Chạy trên HTTP/2 → TCP          |
| **Message Format**          | Tự định nghĩa (raw bytes) | Protocol Buffers (structured)   |
| **Schema/Contract**         | Không có                  | `.proto` files                  |
| **Code Generation**         | Không có                  | Tự động generate stubs          |
| **Serialization**           | Manual                    | Automatic (Protobuf)            |
| **Error Handling**          | Manual                    | Built-in status codes           |
| **Streaming**               | Full-duplex (basic)       | 4 patterns có cấu trúc          |
| **Load Balancing**          | Tự implement              | Built-in                        |
| **Service Discovery**       | Tự implement              | Tích hợp (với Kubernetes, etc.) |
| **Interceptors/Middleware** | Tự implement              | Built-in support                |
| **Deadlines/Timeouts**      | Tự implement              | Built-in                        |
| **Cancellation**            | Manual                    | Propagated automatically        |
| **Metadata**                | Tự định nghĩa             | Headers support                 |
| **Performance Overhead**    | Minimal                   | Nhỏ (HTTP/2 + Protobuf)         |
| **Development Speed**       | Chậm (nhiều code)         | Nhanh (code generated)          |
| **Type Safety**             | Không có                  | Strong typing                   |
| **Cross-language**          | Phức tạp                  | Native support                  |

### 5.3 Performance Comparison

```
Latency (lower is better)
──────────────────────────────────────────────────────────
Raw TCP        │████                    │ ~0.1ms
gRPC           │██████                  │ ~0.3ms
REST/JSON      │████████████████████    │ ~1.5ms
──────────────────────────────────────────────────────────

Throughput (higher is better) - Messages/second
──────────────────────────────────────────────────────────
Raw TCP        │████████████████████████████████│ ~500k
gRPC           │████████████████████████████    │ ~400k
REST/JSON      │████████████████                │ ~200k
──────────────────────────────────────────────────────────

Message Size (lower is better) - bytes for same data
──────────────────────────────────────────────────────────
Protobuf       │████                    │ ~50 bytes
JSON           │████████████████        │ ~150 bytes
XML            │████████████████████████│ ~300 bytes
──────────────────────────────────────────────────────────
```

### 5.4 Complexity Comparison

**Raw TCP Implementation** (pseudo-code):

```typescript
// Server
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    // 1. Parse custom protocol header
    const header = parseHeader(data.slice(0, 8));

    // 2. Deserialize body (custom logic)
    const body = deserialize(data.slice(8), header.type);

    // 3. Route to handler (manual routing)
    const handler = routes[header.method];
    const result = handler(body);

    // 4. Serialize response (custom logic)
    const response = serialize(result);

    // 5. Add header
    const responseHeader = createHeader(response.length);

    // 6. Send
    socket.write(Buffer.concat([responseHeader, response]));
  });

  // Handle errors, connection management, etc.
});
```

**gRPC Implementation** (NestJS):

```typescript
// Server - Controller
@Controller()
export class UserController {
  @GrpcMethod('UserService', 'GetUser')
  getUser(request: GetUserRequest): User {
    // Just business logic - framework handles everything else
    return this.userService.findById(request.id);
  }
}
```

---

## 6. Khi nào sử dụng TCP và gRPC

### 6.1 Sử dụng Raw TCP khi

```
┌─────────────────────────────────────────────────────────────┐
│                    Raw TCP Use Cases                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Embedded Systems / IoT                                   │
│     - Resource-constrained devices                           │
│     - Custom lightweight protocols                           │
│     - Direct hardware communication                          │
│                                                              │
│  ✅ Real-time Gaming                                         │
│     - Sub-millisecond latency requirements                   │
│     - Custom binary protocols for game state                 │
│     - UDP might be even better for some games                │
│                                                              │
│  ✅ Financial Trading Systems                                │
│     - Ultra-low latency (microseconds matter)                │
│     - Custom optimized protocols                             │
│     - Direct market data feeds                               │
│                                                              │
│  ✅ Custom Protocol Implementation                           │
│     - Building new protocols                                 │
│     - Legacy system integration                              │
│     - Proprietary communication standards                    │
│                                                              │
│  ✅ Maximum Performance Critical                             │
│     - When HTTP/2 overhead is unacceptable                   │
│     - Extremely high throughput requirements                 │
│     - Every byte counts                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Sử dụng gRPC khi

```
┌─────────────────────────────────────────────────────────────┐
│                     gRPC Use Cases                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Microservices Architecture                               │
│     - Service-to-service communication                       │
│     - Strong contracts between services                      │
│     - Polyglot environments                                  │
│                                                              │
│  ✅ Real-time Communication                                  │
│     - Chat applications                                      │
│     - Live updates/notifications                             │
│     - Collaborative tools                                    │
│                                                              │
│  ✅ Mobile Applications                                      │
│     - Efficient binary protocol                              │
│     - Lower battery consumption                              │
│     - Smaller payload sizes                                  │
│                                                              │
│  ✅ Streaming Data                                           │
│     - Log aggregation                                        │
│     - Metrics collection                                     │
│     - Event sourcing                                         │
│                                                              │
│  ✅ API-First Development                                    │
│     - Contract-first design                                  │
│     - Auto-generated documentation                           │
│     - Type-safe client/server code                           │
│                                                              │
│  ✅ Cloud Native Applications                                │
│     - Kubernetes service mesh                                │
│     - Cloud provider integration                             │
│     - Distributed systems                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Decision Matrix

```
                        ┌─────────────────────────────────┐
                        │      Decision: TCP vs gRPC      │
                        └─────────────────────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │   Cần latency < 0.1ms?          │
                        └─────────────────────────────────┘
                              │                    │
                             YES                  NO
                              │                    │
                              ▼                    ▼
                        ┌──────────┐    ┌─────────────────────┐
                        │ Raw TCP  │    │ Multi-language?     │
                        └──────────┘    └─────────────────────┘
                                              │            │
                                             YES          NO
                                              │            │
                                              ▼            ▼
                                        ┌──────────┐  ┌─────────────────┐
                                        │   gRPC   │  │ Need streaming? │
                                        └──────────┘  └─────────────────┘
                                                           │          │
                                                          YES        NO
                                                           │          │
                                                           ▼          ▼
                                                     ┌──────────┐ ┌──────────┐
                                                     │   gRPC   │ │ REST/gRPC│
                                                     └──────────┘ └──────────┘
```

---

## 7. gRPC trong Microservices

### 7.1 Kiến trúc điển hình

```
                    ┌─────────────────────────────────────────────┐
                    │                  CLIENTS                     │
                    │         (Web, Mobile, Third-party)           │
                    └─────────────────────┬───────────────────────┘
                                          │
                                    REST/GraphQL
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway / BFF                               │
│                        (Authentication, Rate Limiting)                       │
└───────────┬─────────────────┬─────────────────┬─────────────────┬───────────┘
            │                 │                 │                 │
          gRPC              gRPC              gRPC              gRPC
            │                 │                 │                 │
            ▼                 ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │   Authorizer  │ │    Invoice    │ │    Product    │ │  User Access  │
    │    Service    │ │    Service    │ │    Service    │ │    Service    │
    └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
            │                 │                 │                 │
            └────────────┬────┴────────────┬────┴─────────────────┘
                         │                 │
                   gRPC (internal)   gRPC (internal)
                         │                 │
                         ▼                 ▼
                ┌─────────────────────────────────────┐
                │           Shared Services            │
                │    (Logging, Monitoring, Config)     │
                └─────────────────────────────────────┘
```

### 7.2 NestJS gRPC Implementation Example

**Proto file** (`proto/authorizer.proto`):

```protobuf
syntax = "proto3";

package authorizer;

service AuthorizerService {
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc GetPermissions(GetPermissionsRequest) returns (GetPermissionsResponse);
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool valid = 1;
  string user_id = 2;
  repeated string roles = 3;
}

message GetPermissionsRequest {
  string user_id = 1;
  string resource = 2;
}

message GetPermissionsResponse {
  repeated string permissions = 1;
}
```

**Server** (`authorizer.grpc.controller.ts`):

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AuthorizerGrpcController {
  constructor(private readonly authService: AuthorizerService) {}

  @GrpcMethod('AuthorizerService', 'ValidateToken')
  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const result = await this.authService.validateToken(request.token);
    return {
      valid: result.isValid,
      userId: result.userId,
      roles: result.roles,
    };
  }

  @GrpcMethod('AuthorizerService', 'GetPermissions')
  async getPermissions(request: GetPermissionsRequest): Promise<GetPermissionsResponse> {
    const permissions = await this.authService.getPermissions(request.userId, request.resource);
    return { permissions };
  }
}
```

**Client** (`bff/authorizer.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTHORIZER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'authorizer',
          protoPath: join(__dirname, '../proto/authorizer.proto'),
          url: 'localhost:5001',
        },
      },
    ]),
  ],
})
export class AuthorizerModule {}
```

### 7.3 Best Practices

| Category           | Best Practice                               |
| ------------------ | ------------------------------------------- |
| **Proto Design**   | Sử dụng semantic versioning cho packages    |
| **Proto Design**   | Không xóa/đổi field numbers, chỉ deprecate  |
| **Proto Design**   | Sử dụng `optional` cho fields có thể null   |
| **Error Handling** | Sử dụng gRPC status codes chuẩn             |
| **Error Handling** | Trả về detailed error messages              |
| **Performance**    | Sử dụng connection pooling                  |
| **Performance**    | Enable keepalive để tái sử dụng connections |
| **Security**       | Luôn sử dụng TLS trong production           |
| **Security**       | Implement authentication interceptors       |
| **Observability**  | Add tracing với OpenTelemetry               |
| **Observability**  | Log request/response metadata               |

---

## 8. Luồng gọi gRPC `verifyUserToken` trong Project

### 8.1 Tổng quan luồng

Trong project này, method `verifyUserToken` được gọi khi **UserGuard** xác thực token của user trước khi cho phép truy cập vào các API được bảo vệ.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           LUỒNG GỌI verifyUserToken                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐          ┌──────────────┐         ┌───────────────────────────────┐
     │  Client  │          │     BFF      │         │      Authorizer Service       │
     │(Browser) │          │   Service    │         │                               │
     └────┬─────┘          └──────┬───────┘         └───────────────┬───────────────┘
          │                       │                                 │
          │  1. HTTP Request      │                                 │
          │   (với Bearer Token)  │                                 │
          │──────────────────────►│                                 │
          │                       │                                 │
          │                       │  2. UserGuard chặn request      │
          │                       │     và extract token            │
          │                       │                                 │
          │                       │  3. Check cache                 │
          │                       │     (Redis/Memory)              │
          │                       │                                 │
          │                       │  4. Nếu không có cache:         │
          │                       │     gRPC call verifyUserToken   │
          │                       │─────────────────────────────────►
          │                       │                                 │
          │                       │                                 │  5. Verify JWT
          │                       │                                 │     với Keycloak
          │                       │                                 │
          │                       │  6. Response (user data)        │
          │                       │◄─────────────────────────────────
          │                       │                                 │
          │                       │  7. Cache response              │
          │                       │     (30 phút)                   │
          │                       │                                 │
          │                       │  8. Set user data vào request   │
          │                       │                                 │
          │  9. Response          │                                 │
          │◄──────────────────────│                                 │
          │                       │                                 │
```

### 8.2 Các bước chi tiết

#### Bước 1: Client gửi HTTP Request

```http
POST /api/invoice/create HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...
Content-Type: application/json

{
  "amount": 1000,
  "customerId": "123"
}
```

#### Bước 2-3: UserGuard xử lý

File: [`libs/guards/src/lib/user.guard.ts`](libs/guards/src/lib/user.guard.ts)

```typescript
@Injectable()
export class UserGuard implements CanActivate {
  private authorizerService: AuthorizerService;

  constructor(
    @Inject(GRPC_SERVICES.AUTHORIZER_SERVICE)
    private readonly grpcClient: ClientGrpc
  ) {}

  onModuleInit() {
    // Khởi tạo gRPC client service
    this.authorizerService = this.grpcClient.getService<AuthorizerService>('AuthorizerService');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const authOptions = this.reflector.get<{ secured: boolean }>(MetadataKeys.SECURED, context.getHandler());

    // API public thì không cần verify
    if (!authOptions?.secured) {
      return true;
    }

    return this.verifyToken(req);
  }
}
```

#### Bước 4: gRPC Call `verifyUserToken`

```typescript
private async verifyToken(request: any): Promise<boolean> {
  const token = getAccessToken(request);
  const cacheKey = this.generateTokenCacheKey(token);
  const processId = request[MetadataKeys.PROCESS_ID];

  // Check cache trước
  const cacheData = await this.cacheManager.get<AuthorizeResponse>(cacheKey);
  if (cacheData) {
    setUserData(request, cacheData);
    return true;
  }

  // ⭐ GỌI gRPC METHOD verifyUserToken ⭐
  const { data: res } = await firstValueFrom(
    this.authorizerService.verifyUserToken({
      token,
      processId,
    })
  );

  if (!res?.valid) {
    throw new UnauthorizedException("Token doesn't exist");
  }

  // Cache kết quả 30 phút
  setUserData(request, res);
  await this.cacheManager.set(cacheKey, res, 30 * 60 * 1000);
  return true;
}
```

#### Bước 5: Authorizer xử lý request

File: [`apps/authorizer/src/app/modules/authorizer/controllers/authorizer.grpc.controller.ts`](apps/authorizer/src/app/modules/authorizer/controllers/authorizer.grpc.controller.ts)

```typescript
@Controller()
export class AuthorizerGrpcController {
  constructor(private readonly authorizerService: AuthorizerService) {}

  @GrpcMethod('AuthorizerService', 'verifyUserToken')
  async verifyUserToken(params: VerifyUserTokenRequest): Promise<VerifyUserTokenResponse> {
    // Gọi service để verify token với Keycloak
    const result = await this.authorizerService.verifyUserToken(params.token, params.processId);
    return Response.success(result);
  }
}
```

### 8.3 Khi nào method được gọi?

| Trigger                     | Điều kiện                         | Kết quả                       |
| --------------------------- | --------------------------------- | ----------------------------- |
| **HTTP Request tới BFF**    | API có decorator `@Secured(true)` | UserGuard chạy                |
| **UserGuard.canActivate()** | authOptions.secured = true        | verifyToken() được gọi        |
| **verifyToken()**           | Cache MISS                        | gRPC verifyUserToken được gọi |
| **verifyToken()**           | Cache HIT                         | Không gọi gRPC, dùng cache    |

### 8.4 Các services sử dụng UserGuard

Bất kỳ controller nào trong BFF sử dụng decorator `@Secured(true)` sẽ trigger gọi `verifyUserToken`:

```typescript
// Ví dụ trong BFF Invoice Controller
@Controller('invoice')
export class InvoiceController {
  @Post('create')
  @Secured(true) // ← Decorator này trigger UserGuard
  createInvoice(@Body() data: CreateInvoiceDto) {
    // UserGuard sẽ gọi gRPC verifyUserToken trước khi method này chạy
    return this.invoiceService.create(data);
  }

  @Get('public-list')
  @Secured(false) // ← API public, không gọi verifyUserToken
  getPublicList() {
    return this.invoiceService.getPublicList();
  }
}
```

### 8.5 Flow Diagram với Mermaid

```mermaid
sequenceDiagram
    participant C as Client
    participant B as BFF Service
    participant G as UserGuard
    participant R as Redis Cache
    participant A as Authorizer (gRPC)
    participant K as Keycloak

    C->>B: HTTP POST /api/invoice (Bearer Token)
    B->>G: canActivate()
    G->>G: Check @Secured decorator

    alt API is secured
        G->>G: Extract token from header
        G->>R: Get cached user data

        alt Cache HIT
            R-->>G: Return cached data
            G->>B: Set user data, return true
        else Cache MISS
            R-->>G: null
            G->>A: gRPC verifyUserToken(token, processId)
            A->>K: Verify JWT token
            K-->>A: Token valid + user info
            A-->>G: VerifyUserTokenResponse
            G->>R: Cache response (30 min TTL)
            G->>B: Set user data, return true
        end

        B->>B: Execute controller method
        B-->>C: HTTP Response
    else API is public
        G->>B: return true (no verification)
        B->>B: Execute controller method
        B-->>C: HTTP Response
    end
```

### 8.6 Cấu hình gRPC Connection

File: [`apps/authorizer/src/main.ts`](apps/authorizer/src/main.ts)

```typescript
// Authorizer service đăng ký gRPC server
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.GRPC,
  options: {
    package: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.name,
    protoPath: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.options.protoPath,
    url: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.options.url,
  },
});
```

File: Cấu hình client trong các service khác (User-Access, BFF, etc.)

```typescript
// Đăng ký gRPC client để gọi Authorizer
ClientsModule.registerAsync([
  {
    name: GRPC_SERVICES.AUTHORIZER_SERVICE,
    useFactory: (config: ConfigService) => ({
      transport: Transport.GRPC,
      options: {
        package: 'authorizer',
        protoPath: join(__dirname, 'proto/authorizer.proto'),
        url: config.get('AUTHORIZER_GRPC_URL'),
      },
    }),
    inject: [ConfigService],
  },
]),
```

---

## 9. Tóm tắt gRPC trong Dự án Invoice App

### 9.1 Cấu trúc gRPC trong Project

```
libs/
├── configuration/src/lib/
│   └── grpc.config.ts              # Cấu hình gRPC services
├── interfaces/src/lib/
│   ├── proto/
│   │   ├── authorizer/
│   │   │   └── authorizer.proto    # Proto định nghĩa AuthorizerService
│   │   └── user-access/
│   │       └── user-access.proto   # Proto định nghĩa UserAccessService
│   └── grpc/
│       ├── authorizer/
│       │   ├── authorizer-request.dto.ts
│       │   └── authorizer-response.dto.ts
│       └── user-access/
│           └── ...
└── guards/src/lib/
    └── user.guard.ts               # Guard sử dụng gRPC client

apps/
├── authorizer/
│   └── src/
│       ├── main.ts                 # Đăng ký gRPC server
│       └── app/modules/authorizer/
│           ├── controllers/
│           │   └── authorizer.grpc.controller.ts  # gRPC Server handlers
│           └── services/
│               └── authorizer.service.ts          # Sử dụng gRPC client
└── user-access/
    └── src/main.ts                 # Đăng ký gRPC server
```

### 9.2 Các gRPC Services trong Project

| Service               | Package                    | Port | Proto File          |
| --------------------- | -------------------------- | ---- | ------------------- |
| **AuthorizerService** | `GRPC_AUTHORIZER_SERVICE`  | 5100 | `authorizer.proto`  |
| **UserAccessService** | `GRPC_USER_ACCESS_SERVICE` | 5200 | `user-access.proto` |

### 9.3 Proto Files thực tế

#### authorizer.proto

```protobuf
syntax = "proto3";

package GRPC_AUTHORIZER_SERVICE;

import "user-access.proto"

service AuthorizerService {
  rpc verifyUserToken (VerifyUserTokenRequest) returns (VerifyUserTokenResponse)
}

message VerifyUserTokenRequest {
  string token = 1;
  string processId = 2;
}

message VerifyUserTokenResponse {
  string code = 1;
  AuthorizeResponse data = 2;
  string error = 3;
}

message AuthorizeResponse {
  bool valid = 1;
  optional AuthorizedMetadata metadata = 2;
}

message AuthorizedMetadata {
  optional string userId = 1;
  optional User user = 2;
  repeated string permissions = 3;
  optional JWTPayload jwt = 4;
}
```

#### user-access.proto

```protobuf
syntax = "proto3";

package GRPC_USER_ACCESS_SERVICE;

service UserAccessService {
  rpc getByUserId(UserById) returns (UserResponse)
}

message UserById {
  string userId = 1;
  string processId = 2;
}

message User {
  string _id = 1;
  string firstName = 2;
  string lastName = 3;
  string email = 4;
  repeated Role roles = 5;
}

message Role {
  string name = 1;
  string description = 2;
  repeated string permissions = 3;
}

message UserResponse {
  string code = 1;
  User data = 2;
  string error = 3;
}
```

### 9.4 Cấu hình gRPC

File: [`libs/configuration/src/lib/grpc.config.ts`](libs/configuration/src/lib/grpc.config.ts)

```typescript
export enum GRPC_SERVICES {
  AUTHORIZER_SERVICE = 'GRPC_AUTHORIZER_SERVICE',
  USER_ACCESS_SERVICE = 'GRPC_USER_ACCESS_SERVICE',
}

export class GrpcConfiguration {
  GRPC_AUTHORIZER_SERVICE: GrpcOptions & { name: string };
  GRPC_USER_ACCESS_SERVICE: GrpcOptions & { name: string };

  constructor() {
    this.GRPC_AUTHORIZER_SERVICE = GrpcConfiguration.setValue({
      key: GRPC_SERVICES.AUTHORIZER_SERVICE,
      protoPath: ['./proto/authorizer.proto'],
      port: Number(process.env['AUTHORIZER_SERVICE_PORT']) || 5100,
      host: process.env['AUTHORIZER_SERVICE_HOST'] || 'localhost',
    });

    this.GRPC_USER_ACCESS_SERVICE = GrpcConfiguration.setValue({
      key: GRPC_SERVICES.USER_ACCESS_SERVICE,
      protoPath: ['./proto/user_access.proto'],
      port: Number(process.env['USER_ACCESS_SERVICE_PORT']) || 5200,
      host: process.env['USER_ACCESS_SERVICE_HOST'] || 'localhost',
    });
  }
}

// Provider để inject vào modules
export const GrpcProvider = (serviceName: GRPC_SERVICES): ClientsProviderAsyncOptions => {
  return {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      return configService.get(`GRPC_SERV.${serviceName}`);
    },
    name: serviceName,
  };
};
```

### 9.5 Cách đăng ký gRPC Server

File: [`apps/authorizer/src/main.ts`](apps/authorizer/src/main.ts)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Đăng ký gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.name,
      protoPath: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.options.protoPath,
      url: AppModule.CONFIGURATION.GRPC_SERV.GRPC_AUTHORIZER_SERVICE.options.url,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
}
```

### 9.6 Cách tạo gRPC Server Handler

File: [`apps/authorizer/src/app/modules/authorizer/controllers/authorizer.grpc.controller.ts`](apps/authorizer/src/app/modules/authorizer/controllers/authorizer.grpc.controller.ts)

```typescript
@Controller()
export class AuthorizerGrpcController {
  constructor(private readonly authorizerService: AuthorizerService) {}

  // Tham số 1: Tên service trong file .proto
  // Tham số 2: Tên method trong file .proto
  @GrpcMethod('AuthorizerService', 'verifyUserToken')
  async verifyUserToken(params: VerifyUserTokenRequest): Promise<VerifyUserTokenResponse> {
    const result = await this.authorizerService.verifyUserToken(params.token, params.processId);
    return Response.success(result);
  }
}
```

### 9.7 Cách sử dụng gRPC Client

#### Bước 1: Đăng ký client trong Module

File: [`apps/authorizer/src/app/modules/authorizer/authorizer.module.ts`](apps/authorizer/src/app/modules/authorizer/authorizer.module.ts)

```typescript
@Module({
  imports: [
    ClientsModule.registerAsync([
      GrpcProvider(GRPC_SERVICES.USER_ACCESS_SERVICE), // Đăng ký gRPC client
    ]),
  ],
  // ...
})
export class AuthorizerModule {}
```

#### Bước 2: Inject và sử dụng trong Service

File: [`apps/authorizer/src/app/modules/authorizer/services/authorizer.service.ts`](apps/authorizer/src/app/modules/authorizer/services/authorizer.service.ts)

```typescript
@Injectable()
export class AuthorizerService {
  private userAccessService: UserAccessService;

  constructor(
    @Inject(GRPC_SERVICES.USER_ACCESS_SERVICE)
    private readonly userAccessGrpcClient: ClientGrpc
  ) {}

  // Khởi tạo service trong onModuleInit
  onModuleInit() {
    this.userAccessService = this.userAccessGrpcClient.getService<UserAccessService>('UserAccessService');
  }

  private async validationUser(userId: string, processId: string) {
    // Gọi gRPC method
    const user = await firstValueFrom(this.userAccessService.getByUserId({ userId, processId }).pipe(map((res) => res.data)));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
```

### 9.8 Luồng gRPC trong Project

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        LUỒNG gRPC TRONG DỰ ÁN                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

                               ┌─────────────────┐
                               │    Client       │
                               │  (Browser/App)  │
                               └────────┬────────┘
                                        │ HTTP + Bearer Token
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BFF Service                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  UserGuard                                                               │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │    │
│  │  │ 1. Extract token from Authorization header                       │   │    │
│  │  │ 2. Check cache (Redis)                                          │   │    │
│  │  │ 3. If cache miss → gRPC call to Authorizer                      │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ gRPC: verifyUserToken()
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Authorizer Service                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  AuthorizerGrpcController                                               │    │
│  │  @GrpcMethod('AuthorizerService', 'verifyUserToken')                   │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │    │
│  │  │ 1. Decode JWT token                                              │   │    │
│  │  │ 2. Verify với Keycloak JWKS                                     │   │    │
│  │  │ 3. Get user info từ User-Access service                         │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ gRPC: getByUserId()
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          User-Access Service                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  UserAccessGrpcController                                               │    │
│  │  @GrpcMethod('UserAccessService', 'getByUserId')                       │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │    │
│  │  │ 1. Query user từ MongoDB                                         │   │    │
│  │  │ 2. Populate roles và permissions                                 │   │    │
│  │  │ 3. Return UserResponse                                           │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 9.9 Tổng kết Implementation trong Project

| Component          | File                                         | Vai trò             |
| ------------------ | -------------------------------------------- | ------------------- |
| **Proto files**    | `libs/interfaces/src/lib/proto/`             | Định nghĩa contract |
| **Config**         | `libs/configuration/src/lib/grpc.config.ts`  | Cấu hình services   |
| **Server Handler** | `*.grpc.controller.ts`                       | Xử lý gRPC requests |
| **Client Usage**   | Service files với `@Inject(GRPC_SERVICES.*)` | Gọi gRPC methods    |
| **Interface**      | `libs/interfaces/src/lib/grpc/`              | TypeScript types    |

### 9.10 Environment Variables

```env
# Authorizer gRPC Service
AUTHORIZER_SERVICE_HOST=localhost
AUTHORIZER_SERVICE_PORT=5100

# User Access gRPC Service
USER_ACCESS_SERVICE_HOST=localhost
USER_ACCESS_SERVICE_PORT=5200
```

---

## Tổng kết

### So sánh nhanh

| Aspect               | TCP        | gRPC       | Winner |
| -------------------- | ---------- | ---------- | ------ |
| Performance          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | TCP    |
| Developer Experience | ⭐⭐       | ⭐⭐⭐⭐⭐ | gRPC   |
| Type Safety          | ⭐         | ⭐⭐⭐⭐⭐ | gRPC   |
| Cross-language       | ⭐⭐       | ⭐⭐⭐⭐⭐ | gRPC   |
| Streaming            | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | gRPC   |
| Flexibility          | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | TCP    |
| Ecosystem            | ⭐⭐       | ⭐⭐⭐⭐⭐ | gRPC   |

### Kết luận

- **TCP** là nền tảng transport layer - gRPC chạy trên nó
- **gRPC** là framework RPC hiện đại, phù hợp cho hầu hết microservices
- Chọn **Raw TCP** khi cần hiệu năng tối đa hoặc custom protocols
- Chọn **gRPC** khi xây dựng distributed systems, cần type safety và developer productivity

### Trong Project Invoice App

- Sử dụng **gRPC** cho internal service communication (BFF ↔ Authorizer ↔ User-Access)
- **2 gRPC Services**: `AuthorizerService` (port 5100) và `UserAccessService` (port 5200)
- **Pattern**: Request-Response (Unary RPC)
- **Use case chính**: Token verification và User data retrieval
