# Arquitectura – Backend Hexagonal (Ports & Adapters)

Este documento describe cómo se aplica la **Arquitectura Hexagonal** en el proyecto y las decisiones de diseño asociadas.

---

## 1. Motivación de la arquitectura

El objetivo es que el **núcleo de negocio (dominio)** sea independiente de:

- Frameworks (Express, Fastify, etc.)
- Bases de datos y ORMs
- APIs externas (Telegram, servicios de IA, etc.)

Así, el dominio puede evolucionar, testearse y reutilizarse sin acoplarse a detalles de infraestructura. Los cambios en la BD, en la API de Telegram o en el transporte HTTP se confinan en **adaptadores** que implementan **puertos** definidos por el dominio o por la capa de aplicación.

---

## 2. Capas y responsabilidades

### 2.1 Dominio (`domain`)

- **Entidades:** `User`, `Conversation`, `Message` con identidad y reglas de negocio.
- **Objetos de valor:** `Email`, `MessageContent`, `TelegramChatId`, `UserId` (inmutables, sin identidad).
- **Puertos de salida (driven):** Interfaces que expresan *qué* necesita la aplicación del exterior:
  - `IUserRepository`
  - `IConversationRepository`
  - `IMessageRepository`
  - `ITelegramService`
  - `ITokenService` (opcionalmente `IPasswordHasher`)
- **Excepciones de dominio:** Representan fallos de negocio (credenciales inválidas, email duplicado, etc.).
- **Eventos de dominio (bonus):** p. ej. `MessageReceivedEvent` para desacoplar lógica de forma event-driven.

**Regla:** El dominio **no importa** nada de `infrastructure`, ni de frameworks ni de librerías de BD o HTTP.

---

### 2.2 Aplicación / Casos de uso (`application`)

- **Casos de uso:** Un caso de uso por operación de negocio. Orquestan entidades y puertos; no conocen detalles de implementación.
  - `RegisterUserUseCase`
  - `LoginUserUseCase`
  - `ListConversationsUseCase`
  - `SendMessageUseCase`
  - `ProcessTelegramUpdatesUseCase`
- Los casos de uso reciben los **puertos (interfaces)** por constructor; en tiempo de ejecución se inyectan los **adaptadores** concretos.

**Regla:** La aplicación **no importa** infraestructura; solo interfaces (puertos) y dominio.

---

### 2.3 Infraestructura / Adaptadores (`infrastructure`)

Implementaciones concretas de los puertos y del “mundo exterior”:

- **Adaptadores de entrada (driving):**
  - Controladores HTTP (Express/Fastify) que reciben peticiones, validan entrada, llaman al caso de uso correspondiente y devuelven HTTP.
  - Tarea programada (cron/job) que invoca `ProcessTelegramUpdatesUseCase` de forma periódica.
- **Adaptadores de salida (driven):**
  - Repositorios que implementan `IUserRepository`, `IConversationRepository`, `IMessageRepository` usando un ORM y una BD.
  - Cliente Telegram que implementa `ITelegramService` (getUpdates, sendMessage).
  - Servicio JWT que implementa `ITokenService`.

**Regla:** La infraestructura **importa** dominio y/o aplicación (puertos); nunca al revés. Así se cumple la **inversión de dependencias**.

---

## 3. Flujo de dependencias

```
HTTP / Cron  →  Adaptadores de entrada  →  Casos de uso  →  Dominio (entidades, VO)
                     ↓                           ↓
                Adaptadores de salida  ←  Puertos (interfaces)
                (BD, Telegram, JWT)
```

- **Entrada:** Un controlador recibe la petición, la traduce a parámetros de un caso de uso, lo ejecuta y mapea el resultado (o excepciones de dominio) a HTTP.
- **Salida:** Los casos de uso llaman a interfaces (repositorios, `ITelegramService`, etc.); el contenedor de composición inyecta las implementaciones reales (adaptadores).

---

## 4. Estructura de carpetas (propuesta)

La estructura queda a criterio del desarrollador; esta es una opción coherente con lo anterior:

```
src/
  domain/
    entities/
    value-objects/
    ports/           # interfaces (repositorios, Telegram, token)
    errors/
    events/          # opcional (event-driven)
  application/
    use-cases/
  infrastructure/
    http/            # Express, rutas, middlewares (auth)
    persistence/     # implementaciones de repositorios
    telegram/        # adaptador Telegram (getUpdates, sendMessage)
    auth/            # JWT, hashing
    jobs/            # polling programado
  composition/       # wire-up: instanciar adaptadores y casos de uso
```

El punto de entrada (p. ej. `main.ts` o `index.ts`) vive en `src/` o `src/composition/` y arranca el servidor HTTP y, si aplica, el job de polling.

---

## 5. Testeabilidad

- **Dominio:** Tests unitarios puros (entidades, objetos de valor, reglas de negocio) sin mocks.
- **Casos de uso:** Tests unitarios con mocks/stubs de los puertos (repositorios, `ITelegramService`, `ITokenService`); se verifica la orquestación y el comportamiento ante éxitos y excepciones de dominio.
- **Adaptadores:** Tests de integración (repositorios contra BD real o en memoria; cliente Telegram contra API mockeada o fake).

De este modo el dominio y la lógica de aplicación se testean sin base de datos ni servicios externos.

---

## 6. Resumen de principios aplicados

| Principio | Aplicación |
|-----------|------------|
| Inversión de dependencias | El dominio define puertos; la infraestructura los implementa. El dominio no conoce la infraestructura. |
| Puertos de entrada | Casos de uso que exponen la lógica de negocio; los controladores y el job son adaptadores que los invocan. |
| Puertos de salida | Interfaces para persistencia, Telegram y autenticación; implementadas por adaptadores. |
| Casos de uso explícitos | Una operación de negocio = un caso de uso con una única responsabilidad. |
| Entidades y objetos de valor | Entidades con identidad y reglas; valores inmutables para Email, MessageContent, TelegramChatId, etc. |
| Testeabilidad | Dominio y casos de uso testeables con dobles de los puertos; integración acotada a adaptadores. |

Este documento puede ampliarse con diagramas (C4, hexágono) o con ejemplos de código una vez implementado el proyecto.
