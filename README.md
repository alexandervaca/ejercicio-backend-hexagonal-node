# API Telegram – Backend con Arquitectura Hexagonal

API que integra el servicio de mensajería de **Telegram** aplicando **Arquitectura Hexagonal (Ports & Adapters)**. Permite recibir mensajes desde Telegram, procesarlos, enviar respuestas automáticas (aleatorias o configuradas) y administrar conversaciones desde un panel autenticado (registro y login con email y contraseña).

---

## Requisitos

- **Node.js** 18+ (recomendado 20 LTS)
- **npm** 9+ (o pnpm/yarn)
- Cuenta de **Telegram** y un **Bot** creado con [@BotFather](https://t.me/BotFather) para obtener el token del bot.
- (Opcional) **PostgreSQL** si no se usa SQLite para desarrollo.

---

## Conectar con Telegram (BotFather) – polling con getUpdates

La API usa el método **getUpdates** de Telegram (polling): la aplicación consulta periódicamente si hay mensajes nuevos. **No hace falta exponer una URL pública** ni usar HTTPS para desarrollo local.

### 1. Crear el bot y obtener el token

1. Abre **Telegram** y busca **[@BotFather](https://t.me/BotFather)**.
2. Inicia la conversación y envía: **`/newbot`**.
3. Sigue las instrucciones:
   - **Nombre del bot** (ej.: `Mi Bot API`).
   - **Username del bot** (debe terminar en `bot`, ej.: `mi_ejercicio_bot`).
4. BotFather te responderá con un **token** tipo:
   ```text
   123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. **Copia ese token** (sin espacios ni comillas). Es tu `BOT_TOKEN`.

### 2. Configurar el proyecto

1. En la raíz del proyecto, crea o edita el archivo **`.env`** (puedes copiar `.env.example`).
2. Añade o completa la variable con el token que te dio BotFather:
   ```env
   BOT_TOKEN=123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - Una sola línea, sin comillas y sin espacios alrededor del `=`.
3. Reinicia la aplicación si ya estaba en ejecución.

### 3. Probar la conexión

1. Arranca la API: `npm run dev`.
2. En la consola deberías ver: `Polling de Telegram activo`.
3. En Telegram, **busca tu bot por su @username** y envíale un mensaje (ej.: "Hola").
4. El bot debería responder con una de las frases configuradas en `AUTO_REPLY_PHRASES` (por defecto en `.env` o en la variable de entorno).

Si aparece `Telegram API 404` o `token inválido`, revisa que el token en `.env` sea exactamente el de BotFather y que no tenga espacios ni saltos de línea.

---

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd ejercicio-backend-hexagonal-node
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno. Copiar el ejemplo y completar valores:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con al menos:
   - `BOT_TOKEN`: Token del bot de Telegram.
   - `JWT_SECRET`: Clave secreta para firmar tokens JWT.
   - `DATABASE_URL`: (opcional) Si se usa PostgreSQL; si se omite, se puede usar SQLite para desarrollo.

4. Generar el cliente Prisma y crear la base de datos (SQLite por defecto):
   ```bash
   npm run db:generate
   npm run db:push
   ```
   Con `db:push` se crean las tablas según `prisma/schema.prisma`. Para migraciones versionadas usar `npm run db:migrate`.

---

## Ejecución

- **Modo desarrollo** (servidor + polling de Telegram):
  ```bash
  npm run dev
  ```

- **Modo producción** (build y arranque):
  ```bash
  npm run build
  npm start
  ```

- **Solo tests**:
  ```bash
  npm test
  ```

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `BOT_TOKEN` | Sí | Token del bot de Telegram (BotFather). |
| `JWT_SECRET` | Sí | Secreto para firmar y validar JWT. |
| `DATABASE_URL` | No* | URL de conexión a BD (PostgreSQL). Si no se define, se puede usar SQLite por defecto. |
| `PORT` | No | Puerto del servidor HTTP (por defecto ej. 3000). |
| `TELEGRAM_POLL_INTERVAL_MS` | No | Intervalo de polling de Telegram en ms (ej. 5000). |

\* Depende de la implementación final (SQLite por defecto vs solo PostgreSQL).

---

## Documentación de la API

- **Swagger/OpenAPI:** Disponible en `/docs` o `/swagger` una vez levantado el servidor.
- *(Alternativa)* Colección **Postman** en formato `.json` en la raíz del repositorio.

La documentación incluye:
- Endpoints disponibles (método, ruta, descripción).
- Headers requeridos (p. ej. `Authorization: Bearer <token>`).
- Cuerpo de petición y respuestas de éxito y error.

---

## Endpoints principales (referencia)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registro con email y contraseña | No |
| POST | `/auth/login` | Login; devuelve JWT | No |
| GET | `/conversations` | Listado de conversaciones | Sí (JWT) |
| GET | `/conversations/:id/messages` | Mensajes de una conversación | Sí |
| POST | `/conversations/:id/messages` | Enviar mensaje a un contacto | Sí |

La recepción de mensajes desde Telegram se realiza mediante una **tarea en segundo plano (polling con getUpdates)**; no se usa un endpoint HTTP público. Los errores de negocio se manejan con **excepciones de dominio** (véase `src/domain/errors`) y se traducen a códigos HTTP en la capa HTTP.

---

## Estructura del proyecto

- `src/domain` – Entidades, objetos de valor, puertos (interfaces) y excepciones de dominio.
- `src/application` – Casos de uso.
- `src/infrastructure` – Adaptadores (HTTP, persistencia, Telegram, auth, jobs).
- `src/composition` – Ensamblado de dependencias (inyección).
- `tests/` – Tests unitarios y de integración.

Más detalle en [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Documentos de referencia

- [DECISIONS.md](./DECISIONS.md) – Decisiones técnicas y trade-offs.
- [ARCHITECTURE.md](./ARCHITECTURE.md) – Diseño y aplicación de la arquitectura hexagonal.
- [AI_NOTES.md](./AI_NOTES.md) – Uso de IA y estrategias de prompting.

---

## Licencia

Uso según criterios del ejercicio (evaluación técnica).
