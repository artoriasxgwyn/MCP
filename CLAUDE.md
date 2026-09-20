# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responder siempre en Español. Los comentarios del código están en Español; mantener esa convención.

## Comandos

```bash
npm install          # instalar dependencias
npm start            # arrancar el servidor (equivale a: node src/index.js)
```

- No hay linter ni suite de tests configurados (el script `test` de package.json es un placeholder).
- Para verificar sintaxis de un archivo: `node --check src/<ruta>.js`.
- Para probar el arranque del servidor unos segundos: `PORT=9876 timeout 5 node src/index.js`.

### Variables de entorno (`.env`, no está en git)

- `user_id` — API user de Habitica (cabecera `x-api-user`)
- `token` — API key de Habitica (cabecera `x-api-key`)
- `PORT` — puerto del servidor HTTP

Sin `PORT` definido, `httpServer.listen` usa un puerto aleatorio.

## Arquitectura

Servidor MCP para la API de Habitica v3, expuesto por HTTP (streamable HTTP en `/mcp`). Usa ES Modules (`"type": "module"` en package.json).

Flujo de dependencias en capas (cada capa solo conoce a la inferior):

```
index.js → tools/ → services/ → config/client.js → .env
```

- **`src/index.js`** — Punto de entrada. Crea el `McpServer` (de `@modelcontextprotocol/server`), registra las herramientas llamando a las funciones `register*Tools(server)` de `src/tools/`, y levanta el servidor HTTP convirtiendo el handler con `createMcpHandler` + `toNodeHandler` (`@modelcontextprotocol/node`).
- **`src/tools/`** — Define el contrato MCP: esquemas Zod (`inputSchema`), descripciones y los callbacks. Cada archivo exporta una función `register<Api>Tools(server)` que registra todas las herramientas de ese servicio. Los callbacks solo validan/mapean argumentos y delegan a `services/`; devuelven `{ content: [{ type: "text", text: ... }] }` con JSON stringificado, capturando errores y devolviéndolos como texto (no lanzan).
- **`src/services/`** — Lógica de negocio pura: funciones async que llaman a la API externa. No importan nada de MCP ni Zod. Cada función hace try/catch, loguea `error.response?.data || error.message` y relanza.
- **`src/config/client.js`** — Instancia(s) de axios centralizadas con `baseURL` y cabeceras de autenticación. Único lugar que lee credenciales de `process.env`.

Para agregar una nueva integración (p. ej. Raindrop): añadir el cliente axios en `config/client.js`, crear `services/<api>.js` y `tools/<api>Tools.js`, y llamar a `register<Api>Tools(server)` desde `index.js`. No tocar el resto.

## Detalles de la API de Habitica

- Los endpoints de tareas usan `/tasks/user` con `?type=habits|dailys|todos` (nota: es `dailys`, no `dailies`).
- Score de checklist es `POST /tasks/:id/checklist/:itemId/score` (POST, no PUT).
- Para completar un todo se usa el score: `POST /tasks/:id/score/up`.
- Los reminders de dailies se construyen en `buildReminder()` (formato "HH:MM" → objeto con `time` y `startDate` en ISO).

## Notas

- `server.registerTool(name, config, cb)` con tres argumentos está marcado como deprecado por la SDK; el código actual usa esa firma en todo `tools/`. Mantener consistencia con la firma existente salvo que se migre todo a la vez.