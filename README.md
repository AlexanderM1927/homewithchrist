# Home With Christ (HWC)

**HWC** es una Progressive Web App (PWA) de acompañamiento espiritual cristiano. Combina un frontend Quasar, un backend Express, persistencia en MySQL y un proveedor de IA compatible con Ollama para ofrecer chat espiritual, diario personal y administracion de contenido biblico de apoyo.

---

## Tabla de contenidos

- [Stack tecnologico](#stack-tecnologico)
- [Arquitectura general](#arquitectura-general)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Flujos principales](#flujos-principales)
- [Autenticacion](#autenticacion)
- [Consejero IA](#consejero-ia)
- [Diario personal](#diario-personal)
- [Training biblico](#training-biblico)
- [Base de datos](#base-de-datos)
- [Variables de entorno](#variables-de-entorno)
- [Desarrollo local con Docker](#desarrollo-local-con-docker)
- [CI/CD Jenkins](#cicd-jenkins)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | Vue 3 + Quasar 2 (PWA) |
| Estado | Pinia |
| Routing | Vue Router 5 |
| i18n | vue-i18n 11 |
| Backend | Node.js 22 + Express 5 |
| ORM | Sequelize 6 |
| Base de datos | MySQL 8 |
| IA | Proveedor Ollama configurable |
| Contenedores | Docker + Docker Compose |
| CI/CD | Jenkins |
| Proceso prod | PM2 |

---

## Arquitectura general

```text
Usuario PWA
  |
  | HTTP/HTTPS
  v
Frontend Quasar (dev: :9000)
  |
  | /api/*
  v
Backend Express (dev: :8004)
  |-- /api/auth      Auth, perfil y administracion de usuarios
  |-- /api/bot       Chats, historial y streaming SSE
  |-- /api/diary     Diario privado con imagenes opcionales
  |-- /api/training  Temas y versiculos aprobados
  |
  | Sequelize
  v
MySQL 8 (Docker: db_hwc)

Backend Express
  |
  | OLLAMA_URL
  v
Ollama externo o servicio disponible en red
```

En desarrollo local, `compose.yaml` levanta `db`, `backend` y `frontend`. Actualmente **no levanta un contenedor de Ollama**. El backend se conecta al proveedor definido por `OLLAMA_URL`.

---

## Estructura del proyecto

```text
homewithchrist/
|-- compose.yaml              # Docker Compose: db, backend, frontend
|-- Jenkinsfile               # Pipeline CI/CD
|-- AGENTS.md                 # Reglas para agentes de desarrollo
|-- back/
|   |-- server.js             # Express, CORS, rutas API y static public/
|   |-- config/config.js      # Configuracion Sequelize
|   |-- controllers/          # Auth, Chat, Diary, Training
|   |-- middlewares/          # Auth y admin
|   |-- migrations/           # Migraciones Sequelize
|   |-- models/               # User, Role, Chat, DiaryEntry, Topic, Verse, etc.
|   |-- repositories/         # Acceso a datos por dominio
|   |-- routes/               # auth, bot, diary, training
|   |-- seeders/              # Roles y temas iniciales
|   `-- services/
|       |-- AuthService.js
|       |-- ChatService.js
|       `-- ai/               # Provider Ollama
`-- front/
    |-- quasar.config.js      # Config Quasar + Vite + PWA
    |-- src/
    |   |-- boot/api.js       # ApiService base + refresh automatico
    |   |-- layouts/          # LoginLayout y MainLayout
    |   |-- pages/            # Home, advisor, diary, admin, training, users, profile
    |   |-- router/           # Rutas y guards
    |   |-- services/         # Auth, Chat, Diary, Training
    |   `-- stores/           # Pinia auth store
    `-- public/               # Iconos, logo e imagenes publicas
```

---

## Flujos principales

- **Login y registro automatico**: el usuario entra con telefono y PIN de 4 digitos. Si el telefono no existe, se crea el usuario.
- **Home**: muestra accesos a las areas principales y contenido de entrada.
- **Consejero IA**: permite conversar con Hope, guardar chats, retomar conversaciones recientes y recibir respuestas por streaming.
- **Diario**: cada usuario autenticado puede crear, listar, ver y editar entradas privadas. Las entradas aceptan imagen JPG/PNG opcional de hasta 5 MB.
- **Perfil**: el usuario puede actualizar nombre, correo y telefono.
- **Administracion**: usuarios admin pueden gestionar usuarios, roles/contacto y cargar versiculos de training.
- **Training biblico**: los temas y versiculos aprobados por administradores tienen prioridad en el contexto usado por la IA.

---

## Autenticacion

HWC usa un flujo **JWT dual**:

1. `POST /api/auth/login`: recibe `{ name, phone, pin }`. Si el usuario no existe, se registra automaticamente.
2. **Access token**: se devuelve en JSON y se guarda en memoria mediante Pinia.
3. **Refresh token**: se guarda en cookie `HttpOnly`, `sameSite: strict`, con duracion de 7 dias. En produccion se marca como `secure`.
4. `POST /api/auth/refresh`: rota refresh token, emite un nuevo access token y devuelve tambien el usuario.
5. `POST /api/auth/logout`: invalida el refresh token y limpia la cookie.
6. `src/boot/api.js`: reintenta automaticamente peticiones que fallen con `401` usando `/api/auth/refresh`.

Rutas relevantes:

| Metodo | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | Publico |
| POST | `/api/auth/refresh` | Cookie refresh |
| POST | `/api/auth/logout` | Cookie refresh |
| PUT | `/api/auth/profile` | Usuario autenticado |
| GET | `/api/auth/users` | Admin |
| PUT | `/api/auth/users/:id/role` | Admin |
| PUT | `/api/auth/users/:id/contact` | Admin |

---

## Consejero IA

El chat usa **Server-Sent Events (SSE)** para enviar fases y tokens al frontend.

```text
Frontend
  POST /api/bot/chat { prompt, history, chatId? }
    |
    v
Backend
  1. Crea o resuelve el chat
  2. Guarda el mensaje del usuario
  3. Clasifica temas biblicos relevantes
  4. Busca versiculos aprobados
  5. Selecciona entradas utiles del diario privado
  6. Construye mensajes para la IA
  7. Devuelve tokens por text/event-stream
  8. Guarda la respuesta del asistente
```

Rutas:

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/bot/chat` | Envia mensaje y recibe SSE |
| GET | `/api/bot/chats?limit=10` | Lista chats recientes del usuario |
| GET | `/api/bot/chats/:chatId` | Obtiene un chat con mensajes |

### Proveedor IA

El backend usa `back/services/ai/OllamaProvider.js`.

Variables principales:

- `AI_PROVIDER=ollama`
- `OLLAMA_URL=http://host:11434`
- `MAIN_OLLAMA_MODEL=gemma3:4b`
- `SECONDARY_OLLAMA_MODEL=qwen3:0.6b`

Usos:

- Modelo principal: respuesta del chat con `/api/chat`.
- Modelo secundario: titulo de chat, clasificacion de temas y seleccion de entradas del diario con `/api/generate`.

Si `OLLAMA_URL` no esta definido o el proveedor no responde, el backend devuelve error `unavailable` al stream del chat.

---

## Diario personal

El diario es privado por usuario y requiere autenticacion.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/diary?page=1` | Lista entradas paginadas, 10 por pagina |
| GET | `/api/diary/:id` | Obtiene una entrada del usuario |
| POST | `/api/diary` | Crea entrada |
| PUT | `/api/diary/:id` | Actualiza entrada |

Campos:

- `title`: opcional, maximo 150 caracteres.
- `content`: requerido.
- `image`: opcional, `jpg`, `jpeg` o `png`, maximo 5 MB.

Las imagenes se guardan en `back/public/uploads` y se sirven como archivos estaticos desde el backend.

El consejero IA puede usar entradas recientes o relacionadas como contexto personal secundario. Ese contexto nunca tiene prioridad sobre la Biblia o el training aprobado.

---

## Training biblico

El training permite administrar temas y versiculos usados como fuente prioritaria para el consejero IA.

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| GET | `/api/training/topics` | Usuario autenticado | Lista temas activos |
| GET | `/api/training/verses?page=1&limit=20` | Admin | Lista versiculos |
| POST | `/api/training/verses` | Admin | Crea un versiculo asociado a un tema |

Body para crear versiculos:

```json
{
  "topic_id": 1,
  "book": "Juan",
  "chapter": 3,
  "verse_start": 16,
  "verse_end": null,
  "reference": "Juan 3:16",
  "text": "Texto del versiculo",
  "version": "RVR1960",
  "weight": 1,
  "notes": ""
}
```

---

## Base de datos

MySQL 8 se gestiona con Sequelize y migraciones versionadas.

Modelos principales:

- `users`: usuarios, PIN hasheado, rol y refresh token hasheado.
- `roles`: roles como `user` y `admin`.
- `chats`: conversaciones por usuario.
- `chat_messages`: mensajes de usuario/asistente por chat.
- `diary_entries`: entradas privadas del diario, con imagen opcional.
- `topics`: temas biblicos.
- `verses`: versiculos.
- `topic_verses`: relacion entre temas y versiculos.

### Comandos de base de datos

Todos los comandos `node` o `npm` deben ejecutarse dentro del contenedor `backend`.

```bash
docker compose exec -T backend npm run db:migrate
docker compose exec -T backend npm run db:migrate:undo
docker compose exec -T backend npm run db:migrate:undo:all
docker compose exec -T backend npm run db:seed
docker compose exec -T backend npm run db:seed:undo
docker compose exec -T backend npm run db:reset
```

---

Notas:

- En desarrollo, el backend permite CORS con `origin: true` y `credentials: true`.
- En produccion, `ALLOWED_ORIGINS` se usa como lista separada por comas.
- `OLLAMA_URL` debe apuntar a un Ollama accesible desde el contenedor `backend`. Puede ser una IP de red, host interno o servicio Docker agregado manualmente.
- `google-services.json` configura la app Android, pero el backend necesita ademas una cuenta de servicio de Firebase para enviar mensajes. Se puede usar `FIREBASE_SERVICE_ACCOUNT_BASE64`, `FIREBASE_SERVICE_ACCOUNT_JSON` o `GOOGLE_APPLICATION_CREDENTIALS`.

## Desarrollo local con Docker

Levantar servicios:

```bash
docker compose up
```

Levantar en segundo plano:

```bash
docker compose up -d
```

Ver logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Frontend Quasar dev | http://localhost:9000 |
| Backend Express | http://localhost:8004 |
| MySQL | localhost:3306 |

### Ollama en desarrollo

`compose.yaml` no incluye el servicio `ollama`. Para usar el chat, configura `OLLAMA_URL` en `back/.env` apuntando a un Ollama disponible.

Ejemplos:

```env
OLLAMA_URL=http://100.111.143.60:11434
```

Si ejecutas Ollama fuera de Docker, asegurate de que el contenedor `backend` pueda alcanzarlo. Si se agrega un servicio `ollama` al compose en el futuro, `OLLAMA_URL` podria volver a ser algo como:

```env
OLLAMA_URL=http://ollama:11434
```

Modelos esperados por defecto:

```bash
ollama pull gemma3:4b
ollama pull qwen3:0.6b
```

### Comandos Node/NPM

No ejecutes `node` ni `npm` directamente en el host para este proyecto. Usa siempre el contenedor correspondiente.

Frontend:

```bash
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
```

Backend:

```bash
docker compose exec -T backend node --check server.js
docker compose exec -T backend npm run build
```

---

## CI/CD Jenkins

El `Jenkinsfile` define un pipeline con Node.js `node-22.22.3`:

1. **Backend prepare and build**: copia credencial `envhwc` a `back/.env`, ejecuta `npm ci`, `npm run build` y copia `config` a `dist`.
2. **Frontend prepare**: copia credencial `envhwc-front` a `front/.env`, ejecuta `npm ci` y genera iconos PWA con `npx icongenie`.
3. **Frontend build**: ejecuta `quasar build -m pwa`, crea `version.json` y copia la PWA compilada a `back/public`, preservando `public/uploads`.
4. **Deploy**: sincroniza `back` hacia `/var/www/apps/hwc/back`, ejecuta migraciones, seeders y reinicia PM2 con `ecosystem.config.cjs`.
5. **Verify Deployment**: valida PM2 y hace un HTTP check local a `http://127.0.0.1:8004`.

En produccion, Express sirve la PWA compilada desde `back/public/` y mantiene `back/public/uploads/` para imagenes subidas por usuarios.

---

## Convenciones de desarrollo

- Los comandos `node` y `npm` se ejecutan dentro de Docker: `frontend` para frontend y `backend` para backend.
- Las peticiones HTTP del frontend pasan por servicios en `front/src/services/`.
- `front/src/boot/api.js` centraliza `fetch`, credenciales y refresh automatico.
- Pinia mantiene el estado de autenticacion; el access token no se guarda en `localStorage`.
- Los controllers del backend delegan logica a services y repositories.
- Los cambios de esquema se hacen con nuevas migraciones Sequelize.
- El refresh token viaja solo en cookie `HttpOnly` y se almacena hasheado.
- El training aprobado tiene prioridad sobre el diario en el contexto de IA.
- El diario es privado por usuario y solo se usa como contexto secundario cuando es relevante.
