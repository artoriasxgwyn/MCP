import http from "node:http";
import "dotenv/config";
import { z } from "zod";
import {
    getTasks, getTask, deleteTask,
    addItemChecklistTasks, updateItemChecklistTasks, deleteItemChecklistTasks, scoreItemChecklistTasks,
    getHabits, createHabit, updateHabit, scoreHabit,
    getTodos, createTodo, updateTodo, completeTodo,
    getDailies, createDaily, updateDaily, scoreDaily,
    getTags, getTag, createTag, updateTag, deleteTag
} from "./habitica.js";

import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";

const server = new McpServer({
    name: "habitica-mcp",
    version: "1.0.0"
});

// ================= TAREAS (GENÉRICO) =================

server.registerTool(
    "get_tasks",
    {
        description: "Obtiene todas las tareas del usuario desde Habitica (hábitos, todos, dailies, rewards)",
        inputSchema: {}
    },
    async () => {
        try {
            const tasks = await getTasks();
            return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener tareas: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "get_task",
    {
        description: "Obtiene una tarea específica por su ID (sirve para cualquier tipo)",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea")
        }
    },
    async ({ task_id }) => {
        try {
            const response = await getTask(task_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener tarea: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "delete_task",
    {
        description: "Elimina una tarea en Habitica (sirve para cualquier tipo: hábito, todo, daily o reward)",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea a eliminar")
        }
    },
    async ({ task_id }) => {
        try {
            const response = await deleteTask(task_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al eliminar tarea: ${error.message}` }] };
        }
    }
);

// ================= CHECKLIST =================

server.registerTool(
    "add_checklist_item",
    {
        description: "Añade un ítem al checklist de una tarea en Habitica",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea principal en Habitica"),
            item_text: z.string().describe("El texto o nombre del nuevo ítem para el checklist")
        }
    },
    async ({ task_id, item_text }) => {
        try {
            const response = await addItemChecklistTasks(task_id, item_text);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al añadir ítem: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "update_checklist_item",
    {
        description: "Edita el texto de un ítem del checklist de una tarea",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea"),
            item_id: z.string().describe("El ID del ítem del checklist"),
            item_text: z.string().describe("El nuevo texto del ítem")
        }
    },
    async ({ task_id, item_id, item_text }) => {
        try {
            const response = await updateItemChecklistTasks(task_id, item_id, item_text);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al actualizar ítem: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "delete_checklist_item",
    {
        description: "Elimina un ítem del checklist de una tarea en Habitica",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea principal en Habitica"),
            item_id: z.string().describe("El ID del ítem en Habitica")
        }
    },
    async ({ task_id, item_id }) => {
        try {
            const response = await deleteItemChecklistTasks(task_id, item_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al eliminar ítem: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "score_checklist_item",
    {
        description: "Marca o desmarca (toggle) un ítem del checklist como completado",
        inputSchema: {
            task_id: z.string().describe("El ID de la tarea"),
            item_id: z.string().describe("El ID del ítem del checklist")
        }
    },
    async ({ task_id, item_id }) => {
        try {
            const response = await scoreItemChecklistTasks(task_id, item_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al marcar ítem: ${error.message}` }] };
        }
    }
);

// ================= HÁBITOS =================

server.registerTool(
    "get_habits",
    {
        description: "Obtiene todos los hábitos del usuario",
        inputSchema: {}
    },
    async () => {
        try {
            const habits = await getHabits();
            return { content: [{ type: "text", text: JSON.stringify(habits, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener hábitos: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "create_habit",
    {
        description: "Crea un nuevo hábito en Habitica",
        inputSchema: {
            text: z.string().describe("Título del hábito"),
            notes: z.string().optional().describe("Notas del hábito"),
            up: z.boolean().optional().describe("Si permite marcar el '+' (hábito positivo)"),
            down: z.boolean().optional().describe("Si permite marcar el '-' (hábito negativo)"),
            priority: z.number().optional().describe("Dificultad: 0.1, 1, 1.5 o 2")
        }
    },
    async (args) => {
        try {
            const response = await createHabit(args);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al crear hábito: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "update_habit",
    {
        description: "Actualiza un hábito existente",
        inputSchema: {
            task_id: z.string().describe("ID del hábito"),
            text: z.string().optional().describe("Nuevo título"),
            notes: z.string().optional().describe("Nuevas notas"),
            up: z.boolean().optional(),
            down: z.boolean().optional(),
            priority: z.number().optional()
        }
    },
    async ({ task_id, ...fields }) => {
        try {
            const response = await updateHabit(task_id, fields);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al actualizar hábito: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "score_habit",
    {
        description: "Marca un hábito con + (up) o - (down)",
        inputSchema: {
            task_id: z.string().describe("ID del hábito"),
            direction: z.enum(["up", "down"]).describe("up para '+', down para '-'")
        }
    },
    async ({ task_id, direction }) => {
        try {
            const response = await scoreHabit(task_id, direction);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al puntuar hábito: ${error.message}` }] };
        }
    }
);

// ================= DAILIES (TAREAS DIARIAS) =================

server.registerTool(
    "get_dailies",
    {
        description: "Obtiene todas las tareas diarias (dailies) del usuario",
        inputSchema: {}
    },
    async () => {
        try {
            const dailies = await getDailies();
            return { content: [{ type: "text", text: JSON.stringify(dailies, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener dailies: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "create_daily",
    {
        description: "Crea una nueva tarea diaria (daily) en Habitica. Usa 'repeat' para elegir días específicos de la semana.",
        inputSchema: {
            text: z.string().describe("Título de la daily"),
            notes: z.string().optional().describe("Notas de la daily (puede incluir horario, ej: '05:20-06:50 | Bloque profundo')"),
            priority: z.number().optional().describe("Dificultad: 0.1 trivial, 1 fácil, 1.5 media, 2 difícil"),
            frequency: z.enum(["daily", "weekly"]).optional().describe("Frecuencia de repetición (por defecto 'weekly')"),
            everyX: z.number().optional().describe("Cada cuántos días/semanas se repite (por defecto 1)"),
            repeat: z.object({
                su: z.boolean().optional(),
                m: z.boolean().optional(),
                t: z.boolean().optional(),
                w: z.boolean().optional(),
                th: z.boolean().optional(),
                f: z.boolean().optional(),
                s: z.boolean().optional()
            }).optional().describe("Días de la semana en que se repite (solo aplica si frequency es 'weekly'). Si se omite, se repite todos los días."),
            reminders: z.array(z.string()).optional().describe("Horas de recordatorio en formato 'HH:MM' (24h), ej: ['05:20']")
        }
    },
    async (args) => {
        try {
            const response = await createDaily(args);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al crear daily: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "update_daily",
    {
        description: "Actualiza una tarea diaria existente, incluyendo días de repetición",
        inputSchema: {
            task_id: z.string().describe("ID de la daily"),
            text: z.string().optional().describe("Nuevo título"),
            notes: z.string().optional().describe("Nuevas notas"),
            priority: z.number().optional(),
            repeat: z.object({
                su: z.boolean().optional(),
                m: z.boolean().optional(),
                t: z.boolean().optional(),
                w: z.boolean().optional(),
                th: z.boolean().optional(),
                f: z.boolean().optional(),
                s: z.boolean().optional()
            }).optional().describe("Días de la semana en que se repite. Sobrescribe completamente el objeto repeat existente.")
        }
    },
    async ({ task_id, ...fields }) => {
        try {
            const response = await updateDaily(task_id, fields);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al actualizar daily: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "score_daily",
    {
        description: "Marca una daily como completada (up) o la descompleta (down)",
        inputSchema: {
            task_id: z.string().describe("ID de la daily"),
            direction: z.enum(["up", "down"]).describe("up para completar, down para descompletar")
        }
    },
    async ({ task_id, direction }) => {
        try {
            const response = await scoreDaily(task_id, direction);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al puntuar daily: ${error.message}` }] };
        }
    }
);

// ================= TAREAS PENDIENTES (TODOS) =================

server.registerTool(
    "get_todos",
    {
        description: "Obtiene todas las tareas pendientes (todos) del usuario",
        inputSchema: {}
    },
    async () => {
        try {
            const todos = await getTodos();
            return { content: [{ type: "text", text: JSON.stringify(todos, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener tareas pendientes: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "create_todo",
    {
        description: "Crea una nueva tarea pendiente",
        inputSchema: {
            text: z.string().describe("Título de la tarea"),
            notes: z.string().optional().describe("Notas de la tarea"),
            priority: z.number().optional().describe("Dificultad: 0.1, 1, 1.5 o 2"),
            date: z.string().optional().describe("Fecha límite en formato ISO (ej: 2026-09-10)")
        }
    },
    async (args) => {
        try {
            const response = await createTodo(args);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al crear tarea pendiente: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "update_todo",
    {
        description: "Actualiza una tarea pendiente existente",
        inputSchema: {
            task_id: z.string().describe("ID de la tarea"),
            text: z.string().optional().describe("Nuevo título"),
            notes: z.string().optional().describe("Nuevas notas"),
            priority: z.number().optional(),
            date: z.string().optional()
        }
    },
    async ({ task_id, ...fields }) => {
        try {
            const response = await updateTodo(task_id, fields);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al actualizar tarea pendiente: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "complete_todo",
    {
        description: "Marca una tarea pendiente como completada",
        inputSchema: {
            task_id: z.string().describe("ID de la tarea a completar")
        }
    },
    async ({ task_id }) => {
        try {
            const response = await completeTodo(task_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al completar tarea pendiente: ${error.message}` }] };
        }
    }
);

// ================= TAGS =================

server.registerTool(
    "get_tags",
    {
        description: "Obtiene todos los tags del usuario desde Habitica",
        inputSchema: {}
    },
    async () => {
        try {
            const tags = await getTags();
            return { content: [{ type: "text", text: JSON.stringify(tags, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener tags: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "get_tag",
    {
        description: "Obtiene un tag específico por su ID",
        inputSchema: {
            tag_id: z.string().describe("El ID del tag")
        }
    },
    async ({ tag_id }) => {
        try {
            const response = await getTag(tag_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al obtener tag: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "create_tag",
    {
        description: "Crea un nuevo tag en Habitica",
        inputSchema: {
            name: z.string().describe("Nombre del tag (ej: 'Trabajo', 'Salud', 'Aprendizaje')")
        }
    },
    async ({ name }) => {
        try {
            const response = await createTag({ name });
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al crear tag: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "update_tag",
    {
        description: "Actualiza el nombre de un tag existente",
        inputSchema: {
            tag_id: z.string().describe("El ID del tag a actualizar"),
            name: z.string().describe("El nuevo nombre del tag")
        }
    },
    async ({ tag_id, name }) => {
        try {
            const response = await updateTag(tag_id, { name });
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al actualizar tag: ${error.message}` }] };
        }
    }
);

server.registerTool(
    "delete_tag",
    {
        description: "Elimina un tag de Habitica",
        inputSchema: {
            tag_id: z.string().describe("El ID del tag a eliminar")
        }
    },
    async ({ tag_id }) => {
        try {
            const response = await deleteTag(tag_id);
            return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
        } catch (error) {
            return { content: [{ type: "text", text: `Error al eliminar tag: ${error.message}` }] };
        }
    }
);

// ================= SERVIDOR HTTP =================

const mcpHandler = createMcpHandler(() => server);
const handler = toNodeHandler(mcpHandler);
const httpServer = http.createServer(handler);

httpServer.listen(3000, () => {
    console.error("Habitica MCP ejecutándose en http://localhost:3000/mcp");
});