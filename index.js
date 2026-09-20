import http from "node:http";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { registerHabiticaTools } from "./src/tools/habiticaTools.js";
import { registerRaindropTools } from "./src/tools/raindropTools.js";
import "dotenv/config";

const server = new McpServer({
    name: "habitica_mcp",
    version: "1.0.0"
});

// Registro de herramientas por servicio
registerHabiticaTools(server);
registerRaindropTools(server);

const mcpHandler = createMcpHandler(() => server);
const handler = toNodeHandler(mcpHandler);

// ================= CORS Y HEALTH CHECK =================
// El transport Streamable HTTP del SDK rechaza con 400 cualquier GET de /mcp
// que no pertenezca a una sesión MCP activa. Open WebUI hace un GET de
// verificación antes del handshake JSON-RPC, así que aquí se intercepta y se
// responde 200; el resto de peticiones (POST JSON-RPC, GET SSE con sesión,
// DELETE de sesión) pasa intacto al handler del SDK.

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-session-id, mcp-protocol-version, last-event-id",
    "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version"
};

// Se inyectan con setHeader ANTES de delegar: Node fusiona estas cabeceras
// con las que escriba el handler vía writeHead, sin sobrescribirlas.
function aplicarCors(res) {
    for (const [nombre, valor] of Object.entries(CORS_HEADERS)) {
        res.setHeader(nombre, valor);
    }
}

function responderJson(res, status, cuerpo) {
    res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(cuerpo));
}

const httpServer = http.createServer((req, res) => {
    aplicarCors(res);
    const ruta = req.url.split("?")[0];

    // Preflight CORS
    if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
    }

    // Health check en la raíz (útil para Render y para el verify de Open WebUI)
    if (req.method === "GET" && ruta === "/") {
        responderJson(res, 200, { status: "ok", server: "habitica_mcp", version: "1.0.0" });
        return;
    }

    // Health check en /mcp SOLO si la petición no lleva sesión: un GET con
    // mcp-session-id es el stream SSE del protocolo y debe llegar al SDK
    if (req.method === "GET" && (ruta === "/mcp" || ruta === "/mcp/") && !req.headers["mcp-session-id"]) {
        responderJson(res, 200, { status: "ok", endpoint: "/mcp", transport: "streamable-http" });
        return;
    }

    // Todo lo demás (POST JSON-RPC, GET SSE con sesión, DELETE de sesión) va al transport MCP
    handler(req, res);
});

// ================= SERVIDOR HTTP =================

httpServer.listen(process.env.PORT, () => {
    console.error(`Habitica MCP ejecutándose en http://localhost:${process.env.PORT}/mcp`);
});