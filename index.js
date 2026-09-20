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

// ================= SERVIDOR HTTP =================

const mcpHandler = createMcpHandler(() => server);
const handler = toNodeHandler(mcpHandler);
const httpServer = http.createServer(handler);

httpServer.listen(process.env.PORT, () => {
    console.error(`Habitica MCP ejecutándose en http://localhost:${process.env.PORT}/mcp`);
});