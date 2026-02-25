# Decisiones técnicas (DECISIONS.md)

Este documento justifica **trade-offs** realizados durante el desarrollo del backend con arquitectura hexagonal e integración con Telegram.

---

## 1. Polling (getUpdates) en lugar de Webhooks

**Decisión:** Usar **polling** con `getUpdates` de la API de Telegram en lugar de webhooks.

**Alternativa rechazada:** Webhooks (Telegram envía un POST a una URL pública cuando llega un mensaje).

**Justificación:**
- El ejercicio se desarrolla en entorno local; los webhooks exigen una URL pública (ngrok o despliegue) y HTTPS, lo que añade complejidad operativa y configuración.
- El polling permite ejecutar la aplicación con un solo proceso y sin exponer puertos al exterior, simplificando las instrucciones del README y la reproducibilidad.
- La latencia adicional del polling (ej. cada 5–10 segundos) es aceptable para un ejercicio de integración y administración de conversaciones.
- Si en el futuro se requiere menor latencia en producción, el puerto `ITelegramService` permite sustituir el adaptador de polling por uno basado en webhooks sin tocar dominio ni casos de uso.

**Trade-off:** Aceptamos una pequeña demora en la recepción de mensajes a cambio de simplicidad de desarrollo y despliegue local.

---

## 2. Inyección de dependencias manual en lugar de contenedor (tsyringe/inversify)

**Decisión:** Usar **inyección de dependencias manual** (factory/composition root) en lugar de un contenedor IoC (p. ej. tsyringe, inversify).

**Alternativa rechazada:** Contenedor de DI automático con decoradores `@injectable()` y registro por símbolos.

**Justificación:**
- El número de puertos y adaptadores del ejercicio es acotado; un único módulo de composición (p. ej. `composition.ts` o `container.ts`) donde se instancian adaptadores y casos de uso sigue siendo legible y mantenible.
- Se evita una dependencia adicional y la curva de aprendizaje de decoradores y tokens del contenedor.
- El wiring queda explícito y fácil de seguir en un solo archivo, lo que favorece la evaluación del ejercicio y el onboarding.
- Si el proyecto creciera (más casos de uso, más adaptadores), se podría introducir un contenedor sin cambiar la firma de los puertos ni del dominio.

**Trade-off:** Renunciamos a la resolución automática y al registro declarativo a cambio de simplicidad y control explícito del grafo de dependencias.

---

## 3. Respuesta automática con texto aleatorio (configurable) en lugar de IA

**Decisión:** Implementar la **respuesta automática** como texto **aleatorio o configurable** (lista de frases o configuración en BD/variable de entorno), sin integrar un modelo de IA en esta primera entrega.

**Alternativa considerada:** Respuesta dinámica generada por IA (mencionada como bonus en el ejercicio).

**Justificación:**
- El núcleo del ejercicio es la arquitectura hexagonal y la integración con Telegram; la generación por IA es un bonus explícito y añade dependencias (API keys, coste, latencia y manejo de errores de proveedores externos).
- Una respuesta aleatoria o configurable cumple el requisito funcional (“respuesta automática con texto aleatorio o configurable”) y permite validar el flujo completo: recepción → caso de uso → persistencia → envío por Telegram.
- El diseño con un puerto (p. ej. `IResponseGenerator` o lógica dentro del caso de uso parametrizable) permite más adelante sustituir la implementación “aleatoria” por una que llame a un servicio de IA sin modificar el dominio ni el caso de uso.

**Trade-off:** Priorizamos cumplimiento del alcance obligatorio y claridad arquitectónica frente a incluir desde el inicio la capa de IA como bonus.

---

## 4. (Opcional) Base de datos SQLite para desarrollo frente a PostgreSQL

**Decisión (recomendada para el ejercicio):** Soportar **SQLite** como opción por defecto para desarrollo y pruebas (archivo local), dejando la puerta abierta a **PostgreSQL** mediante variable de entorno (p. ej. `DATABASE_URL`).

**Justificación:**
- SQLite no requiere servidor ni instalación adicional; cualquier revisor puede clonar el repo y ejecutar con `npm run dev` sin levantar una BD.
- Los repositorios dependen del puerto (interfaz), no del motor; el mismo código de dominio y casos de uso funciona con un adaptador SQLite o PostgreSQL.
- En un entorno de producción o despliegue (Render, Railway, etc.) se puede usar `DATABASE_URL` apuntando a PostgreSQL sin cambiar la arquitectura.

**Trade-off:** Aceptamos las limitaciones de SQLite en concurrencia y características avanzadas a cambio de cero fricción en desarrollo y evaluación.

---

## 5. TypeScript en lugar de JavaScript

**Decisión:** Usar **TypeScript** para todo el código del backend.

**Alternativa rechazada:** JavaScript plano (con o sin JSDoc).

**Justificación:**
- Los **puertos** (interfaces como `IUserRepository`, `ITelegramService`) son contratos que los adaptadores deben cumplir; en TypeScript las interfaces son de primer orden y el compilador garantiza que las implementaciones coincidan.
- Las **entidades** y **objetos de valor** se benefician de tipos y `readonly`, reduciendo errores y haciendo explícita la inmutabilidad donde aplica.
- La **inyección de dependencias** en casos de uso queda tipada: se evita inyectar un adaptador equivocado o llamar métodos que no existen en el puerto.
- En una evaluación de nivel senior, el tipado estático refuerza la claridad de la arquitectura hexagonal y la mantenibilidad del código.

**Trade-off:** Aceptamos la configuración inicial (tsconfig, compilación) y el rigor de tipos a cambio de mayor seguridad en refactors y contratos explícitos entre capas.

---

*Este documento se irá completando o afinando según se materialicen más decisiones durante la implementación.*
