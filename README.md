# Home With Christ (HWC)

**HWC** es una Progressive Web App (PWA) de consejería espiritual basada en la fe cristiana. Combina inteligencia artificial local (Ollama) con una interfaz conversacional para acompañar al usuario en momentos de reflexión, oración y búsqueda espiritual.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura general](#arquitectura-general)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Autenticación](#autenticación)
- [Chat con el Consejero IA](#chat-con-el-consejero-ia)
- [Base de datos](#base-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Desarrollo local (Docker)](#desarrollo-local-docker)
- [CI/CD — Jenkins](#cicd--jenkins)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Vue 3 + Quasar 2 (PWA) |
| Estado | Pinia |
| Routing | Vue Router 5 |
| i18n | vue-i18n 11 |
| Backend | Node.js + Express 5 |
| ORM | Sequelize 6 |
| Base de datos | MySQL 8 |
| IA local | Ollama (`gemma3`) |
| Contenedores | Docker + Docker Compose |
| CI/CD | Jenkins |
| Proceso prod | PM2 |

---

## Arquitectura general

```
┌────────────────────────────────────────────────────┐
│                   Usuario (PWA)                    │
└──────────────────────┬─────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼─────────────────────────────┐
│              Backend Express (Node.js)             │
│                                                    │
│  /api/auth  ─── AuthController ─── AuthService    │
│  /api/bot   ─── ChatController ─── Ollama (SSE)   │
│                                                    │
│  JWT Access Token (15 min)                         │
│  JWT Refresh Token (7 días) — cookie HttpOnly      │
└──────────┬────────────────────────┬────────────────┘
           │                        │
    ┌──────▼──────┐         ┌───────▼──────┐
    │  MySQL 8    │         │   Ollama     │
    │  (Sequelize)│         │  (gemma3)    │
    └─────────────┘         └──────────────┘
```

---

## Estructura del proyecto

```
homewithchrist/
├── compose.yaml              # Docker Compose: db, backend, frontend, ollama
├── Jenkinsfile               # Pipeline CI/CD
├── back/                     # Backend Node.js
│   ├── server.js             # Entry point, middlewares globales
│   ├── config/config.js      # Config Sequelize por entorno
│   ├── controllers/
│   │   ├── AuthController.js # Login, refresh, logout
│   │   └── ChatController.js # Streaming SSE con Ollama
│   ├── middlewares/
│   │   └── authMiddleware.js # Verifica JWT en header Authorization
│   ├── migrations/           # Migraciones Sequelize
│   ├── models/
│   │   ├── User.js           # user_id, name, phone, password, role_id, refresh_token
│   │   └── Role.js           # role_id, role_name
│   ├── repositories/
│   │   └── UserRepository.js # Acceso a datos de User (findByPhone, create, etc.)
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login|refresh|logout
│   │   └── bot.js            # POST /api/bot/chat
│   ├── seeders/
│   │   └── 20240731231635-roles.js  # Seed de roles iniciales
│   └── services/
│       └── AuthService.js    # Lógica de negocio de autenticación
└── front/                    # Frontend Quasar PWA
    ├── quasar.config.js      # Config Quasar + Vite + PWA
    ├── src/
    │   ├── boot/api.js       # ApiService base (fetch + auto-refresh JWT)
    │   ├── layouts/
    │   │   ├── LoginLayout.vue
    │   │   └── MainLayout.vue
    │   ├── pages/
    │   │   ├── LoginPage.vue
    │   │   ├── IndexPage.vue
    │   │   └── AdvisorPage.vue   # Chat con el consejero IA
    │   ├── router/
    │   │   ├── index.js          # Guard de navegación + checkSession
    │   │   └── routes.js
    │   ├── services/
    │   │   ├── AuthService.js    # login, refresh, logout
    │   │   ├── ChatService.js    # chatStream (SSE)
    │   │   └── README.md         # Convención de servicios HTTP
    │   └── stores/
    │       └── auth.js           # Estado de sesión (Pinia)
```

---

## Autenticación

HWC usa un flujo **JWT dual** (access + refresh token) sin sesiones en servidor tradicionales:

1. **Login / registro automático**: el usuario ingresa nombre, teléfono y PIN. Si el teléfono no existe en la DB, se registra automáticamente.
2. **Access Token** (`JWT_ACCESS_SECRET`): duración 15 minutos, se guarda en memoria (Pinia), se envía como `Authorization: Bearer <token>`.
3. **Refresh Token** (`JWT_REFRESH_SECRET`): duración 7 días, viaja en cookie `HttpOnly` y se guarda **hasheado** (bcrypt) en la columna `refresh_token` de la tabla `users`.
4. **Rotación**: cada `/api/auth/refresh` emite un nuevo par access + refresh, y el refresh anterior queda invalidado en DB.
5. **Auto-refresh**: `ApiService` (`src/boot/api.js`) intercepta cualquier respuesta `401`, renueva el token transparentemente y reintenta la petición original.

```
Login ──► POST /api/auth/login
            ◄── { accessToken } + cookie refresh_token

Petición ──► Bearer <accessToken>
  401?  ──► POST /api/auth/refresh (cookie)
              ◄── { accessToken } nuevo
            ──► Reintenta la petición original

Logout ──► POST /api/auth/logout
            Invalida refresh_token en DB + limpia cookie
```

---

## Chat con el Consejero IA

El chat usa **Server-Sent Events (SSE)** para mostrar la respuesta token a token, igual que ChatGPT:

```
Frontend                Backend               Ollama
   │                       │                     │
   │──POST /api/bot/chat──►│                     │
   │   { prompt }          │──POST /api/generate►│
   │                       │   stream: true       │
   │◄── text/event-stream ─│◄─── chunks ─────────│
   │  data: { token, done }│                     │
   │  (token a token)      │                     │
```

- **Modelo**: `gemma3` (configurable vía `OLLAMA_URL` en `.env`)
- **Renderizado**: la burbuja AI soporta `\n` (saltos de línea) y `**texto**` (negrilla)
- **Ruta**: `POST /api/bot/chat` — body `{ prompt: string }`

---

## Base de datos

MySQL 8 gestionado con **Sequelize** y migraciones versionadas.

### Modelos principales

**users**

| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | INT PK | ID del usuario |
| `name` | STRING | Nombre |
| `phone` | STRING UNIQUE | Teléfono (identificador de login) |
| `email` | STRING UNIQUE | Email (opcional) |
| `password` | STRING | PIN hasheado (bcrypt, 12 rounds) |
| `role_id` | INT FK | Rol del usuario |
| `refresh_token` | TEXT | Refresh token hasheado (nullable) |

**roles**

| Columna | Tipo | Descripción |
|---|---|---|
| `role_id` | INT PK | ID del rol |
| `role_name` | STRING | Nombre del rol (`user`, `admin`, etc.) |

### Comandos de base de datos

```bash
npm run db:migrate          # Aplicar migraciones pendientes
npm run db:migrate:undo     # Revertir última migración
npm run db:migrate:undo:all # Revertir todas las migraciones
npm run db:seed             # Ejecutar todos los seeders
npm run db:seed:undo        # Revertir todos los seeders
npm run db:reset            # Undo all + migrate + seed (dev)
```

---

## Variables de entorno

### Backend (`back/.env`)

```env
PORT=8004

# Base de datos
DB_HOST=db
DB_DATABASE=hwc
DB_USERNAME=root
DB_PASSWORD=secret
DB_CONNECTION=mysql

# JWT
JWT_ACCESS_SECRET=tu_secret_acceso
JWT_REFRESH_SECRET=tu_secret_refresh

# CORS
ALLOWED_ORIGINS=http://localhost:9000

# Ollama
OLLAMA_URL=http://ollama:11434
```

### Frontend (`front/.env`)

```env
VITE_API_URL=http://localhost:8004/api
```

---

## Desarrollo local (Docker)

```bash
# Levantar todos los servicios
docker compose up

# Primera vez: descargar el modelo en Ollama
docker exec -it ollama_hwc ollama pull gemma3

# Ver logs de un servicio específico
docker compose logs -f backend
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Frontend (Quasar dev) | http://localhost:9000 |
| Backend (Express) | http://localhost:8004 |
| Ollama API | http://localhost:11434 |
| MySQL | localhost:3306 |

---

## CI/CD — Jenkins

El `Jenkinsfile` define un pipeline de 5 etapas ejecutadas con Node.js 21:

1. **Backend prepare and build** — `npm ci` + `npm run build` + copia de config al dist.
2. **Frontend prepare** — `npm ci` + generación de íconos PWA con `icongenie`.
3. **Frontend build** — `quasar build -m pwa` + copia de la PWA compilada a `back/public/`.
4. **Deploy** — `rsync` al servidor, migraciones, seeds, reinicio con PM2 (`pm2 startOrReload`).
5. **Verify Deployment** — `pm2 list` + HTTP check local.

> El frontend se sirve como archivos estáticos desde el mismo proceso Express en producción (`back/public/`).

---

## Convenciones de desarrollo

- **Servicios HTTP**: toda petición al backend pasa por un servicio en `front/src/services/`. Ver [front/src/services/README.md](front/src/services/README.md).
- **Estado global**: Pinia stores en `front/src/stores/`. El store de auth es la única fuente de verdad del `accessToken`.
- **Acceso a datos (backend)**: los controllers no tocan los modelos directamente. Usan servicios (`services/`) y repositorios (`repositories/`).
- **Migraciones**: cualquier cambio de esquema se hace con una nueva migración Sequelize, nunca modificando migraciones existentes.
- **Seguridad**: los tokens no se guardan en `localStorage`. El refresh token viaja solo en cookie `HttpOnly`.
