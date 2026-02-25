# Estructura del código (Arquitectura Hexagonal)

- **domain/** – Entidades, value objects, puertos (interfaces) y excepciones. Sin dependencias de infraestructura.
- **application/** – Casos de uso que orquestan dominio y puertos.
- **infrastructure/** – Adaptadores: HTTP, persistencia, Telegram, auth, jobs.
- **composition/** – Ensamblado (wire-up) de dependencias: se instancian adaptadores y casos de uso.
- **index.ts** – Punto de entrada; arranca servidor y jobs usando lo definido en composition.
