# Uso de IA y estrategias de prompting (AI_NOTES.md)

Este archivo documenta **cómo se utiliza la IA** en el desarrollo del ejercicio y qué **estrategias de prompting** se aplican, en línea con los criterios de evaluación del ejercicio.

---

## 1. Objetivos de uso de IA

- **Redacción de código** mediante prompts claros y estructurados por capas (dominio, casos de uso, adaptadores).
- **Generación de documentación** (README, ARCHITECTURE.md, DECISIONS.md, este archivo) y de tests o esqueletos de tests.
- **Explicación de decisiones técnicas** y revisión de consistencia con arquitectura hexagonal.

---

## 2. Estrategia de prompting por capas

Se estructura el prompting para que la IA trabaje **por capas** y evite mezclar dominio con infraestructura:

| Capa | Tipo de prompt | Ejemplo de instrucción |
|------|----------------|-------------------------|
| Dominio | “Definir entidad/objeto de valor sin dependencias externas” | “Crea la entidad User con email y passwordHash; el dominio no debe importar Express ni BD.” |
| Puertos | “Definir interfaz que la aplicación necesita del exterior” | “Define el puerto IUserRepository con save y findByEmail; sin implementación.” |
| Casos de uso | “Implementar caso de uso que use solo puertos y entidades” | “Implementa RegisterUserUseCase que recibe IUserRepository e IPasswordHasher por constructor.” |
| Adaptadores | “Implementar puerto usando tecnología X” | “Implementa IUserRepository con Prisma para PostgreSQL/SQLite.” |
| HTTP | “Traducir HTTP a caso de uso” | “Crea el controller POST /auth/register que valide body, llame a RegisterUserUseCase y devuelva 201 o 400.” |

Así se reduce el riesgo de que el modelo genere código que viole la inversión de dependencias (p. ej. dominio importando Express).

---

## 3. Prompts por tipo de tarea

### 3.1 Generación de código

- **Contexto:** Incluir en el prompt la capa (dominio, aplicación, infraestructura) y la restricción “sin importar infraestructura en dominio”.
- **Formato:** Especificar lenguaje (TypeScript), nombres de entidades/puertos/casos de uso y firma esperada (constructor, parámetros, retorno).
- **Revisión:** Tras generar código, pedir verificación de que no existan imports de infraestructura en archivos de dominio o aplicación (solo puertos/interfaces).

### 3.2 Generación de tests

- **Unitarios (dominio/casos de uso):** “Genera tests unitarios para [Entidad/CasoDeUso]; usa mocks para los puertos; no uses BD ni HTTP.”
- **Integración (adaptadores):** “Genera test de integración para [Repositorio/TelegramAdapter] usando [BD en memoria / API mockeada].”

### 3.3 Documentación

- **DECISIONS.md:** “Redacta un trade-off: elegí X en lugar de Y porque…”
- **ARCHITECTURE.md:** “Explica cómo se aplica la inversión de dependencias en este proyecto” o “Describe la estructura de carpetas y qué va en cada capa.”
- **README:** “Genera sección de instalación y ejecución con variables de entorno y comandos.”

---

## 4. Ajustes y revisiones al output del modelo

- **Revisión de imports:** Comprobar que en `domain/` y `application/` no haya referencias a `infrastructure/`, Express, Prisma, etc.
- **Naming:** Mantener convención (UseCase, I* para puertos, *Repository, *Adapter) y corregir si el modelo usa otro estilo.
- **Responsabilidad única:** Si un caso de uso hace demasiado (p. ej. registro + envío de email), dividir en dos casos de uso o pedir al modelo que los separe.
- **Errores:** Asegurar que los fallos de negocio se representen con excepciones de dominio y que los controladores las mapeen a códigos HTTP adecuados (400, 401, 404, etc.).

---

## 5. Herramientas y flujo

- **Herramienta:** Asistente IA (Cursor/IDE con modelo de lenguaje).
- **Flujo típico:**
  1. Leer requisitos del ejercicio (Ejercicio-Backend-Hexagonal-Sr.md) y ARCHITECTURE.md.
  2. Pedir generación por fases: primero dominio y puertos, luego casos de uso, después adaptadores y HTTP.
  3. Solicitar tests tras cada bloque (dominio, casos de uso, un adaptador).
  4. Pedir documentación (DECISIONS, ARCHITECTURE, README, AI_NOTES) y refinarla con prompts de “revisión” o “completa con…”.

---

## 6. Resumen

- **Estructuración:** Prompts por capas (dominio → aplicación → infraestructura) y por tipo de tarea (código, tests, documentación).
- **Restricciones explícitas:** “Sin dependencias de infraestructura en dominio”, “solo interfaces en aplicación”, “inyección por constructor”.
- **Revisión:** Comprobar imports, naming, responsabilidad única y manejo de errores en el código generado.

Este documento se puede ir ampliando con ejemplos concretos de prompts utilizados y resultados obtenidos durante el desarrollo.
