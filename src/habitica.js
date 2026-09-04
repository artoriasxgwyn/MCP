import "dotenv/config";
import axios from "axios";

const habiticaApi = axios.create({
    baseURL: "https://habitica.com/api/v3/",
    headers: {
        "x-api-user": process.env.user_id,
        "x-api-key": process.env.token,
        "x-client": `${process.env.user_id}-mi-app`
    }
});

// ================= TAREAS (GENÉRICO) =================

export async function getTasks() {
    try {
        const response = await habiticaApi.get("/tasks/user");
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener tareas:", error.response?.data || error.message);
        throw error;
    }
}

export async function getTask(taskId) {
    try {
        const response = await habiticaApi.get(`/tasks/${taskId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener tarea:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteTask(taskId) {
    try {
        const response = await habiticaApi.delete(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar tarea:", error.response?.data || error.message);
        throw error;
    }
}

// ================= CHECKLIST =================

export async function addItemChecklistTasks(taskId, itemName) {
    try {
        const response = await habiticaApi.post(`/tasks/${taskId}/checklist`, { text: itemName });
        return response.data.data;
    } catch (error) {
        console.error("Error al añadir ítem al checklist:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateItemChecklistTasks(taskId, itemId, itemText) {
    try {
        const response = await habiticaApi.put(`/tasks/${taskId}/checklist/${itemId}`, { text: itemText });
        return response.data.data;
    } catch (error) {
        console.error("Error al actualizar ítem del checklist:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteItemChecklistTasks(taskId, itemId) {
    try {
        const response = await habiticaApi.delete(`/tasks/${taskId}/checklist/${itemId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar ítem del checklist:", error.response?.data || error.message);
        throw error;
    }
}

export async function scoreItemChecklistTasks(taskId, itemId) {
    // POST, no PUT — confirmado en los tests oficiales de Habitica
    try {
        const response = await habiticaApi.post(`/tasks/${taskId}/checklist/${itemId}/score`);
        return response.data.data;
    } catch (error) {
        console.error("Error al marcar ítem del checklist:", error.response?.data || error.message);
        throw error;
    }
}

// ================= HÁBITOS =================

export async function getHabits() {
    try {
        const response = await habiticaApi.get("/tasks/user?type=habits");
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener hábitos:", error.response?.data || error.message);
        throw error;
    }
}

export async function createHabit({ text, notes, up = true, down = true, priority }) {
    try {
        const response = await habiticaApi.post("/tasks/user", {
            type: "habit",
            text,
            notes,
            up,
            down,
            priority
        });
        return response.data.data;
    } catch (error) {
        console.error("Error al crear hábito:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateHabit(taskId, fields) {
    try {
        const response = await habiticaApi.put(`/tasks/${taskId}`, fields);
        return response.data.data;
    } catch (error) {
        console.error("Error al actualizar hábito:", error.response?.data || error.message);
        throw error;
    }
}

export async function scoreHabit(taskId, direction) {
    // direction: "up" o "down"
    try {
        const response = await habiticaApi.post(`/tasks/${taskId}/score/${direction}`);
        return response.data.data;
    } catch (error) {
        console.error("Error al puntuar hábito:", error.response?.data || error.message);
        throw error;
    }
}

// ================= DAILIES (TAREAS DIARIAS) =================

export async function getDailies() {
    try {
        const response = await habiticaApi.get("/tasks/user?type=dailys");
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener dailies:", error.response?.data || error.message);
        throw error;
    }
}

export async function createDaily({ text, notes, priority, frequency = "weekly", everyX = 1, repeat }) {
    try {
        const payload = {
            type: "daily",
            text,
            notes,
            priority,
            frequency, // "daily" o "weekly"
            everyX     // cada cuántos días/semanas se repite
        };
        // repeat: { su, m, t, w, th, f, s } booleanos. Si no se especifica, se repite todos los días.
        if (frequency === "weekly") {
            payload.repeat = repeat || { su: true, m: true, t: true, w: true, th: true, f: true, s: true };
        }
        const response = await habiticaApi.post("/tasks/user", payload);
        return response.data.data;
    } catch (error) {
        console.error("Error al crear daily:", error.response?.data || error.message);
        throw error;
    }
}

/**
 * fields puede incluir: text, notes, priority, frequency, everyX,
 * y repeat: { su, m, t, w, th, f, s } booleanos.
 */
export async function updateDaily(taskId, fields) {
    try {
        const response = await habiticaApi.put(`/tasks/${taskId}`, fields);
        return response.data.data;
    } catch (error) {
        console.error("Error al actualizar daily:", error.response?.data || error.message);
        throw error;
    }
}

export async function scoreDaily(taskId, direction = "up") {
    // direction: "up" (completar) o "down" (descompletar)
    try {
        const response = await habiticaApi.post(`/tasks/${taskId}/score/${direction}`);
        return response.data.data;
    } catch (error) {
        console.error("Error al puntuar daily:", error.response?.data || error.message);
        throw error;
    }
}

// ================= TAREAS PENDIENTES (TODOS) =================

export async function getTodos() {
    try {
        const response = await habiticaApi.get("/tasks/user?type=todos");
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener tareas pendientes:", error.response?.data || error.message);
        throw error;
    }
}

export async function createTodo({ text, notes, priority, date }) {
    try {
        const response = await habiticaApi.post("/tasks/user", {
            type: "todo",
            text,
            notes,
            priority,
            date
        });
        return response.data.data;
    } catch (error) {
        console.error("Error al crear tarea pendiente:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateTodo(taskId, fields) {
    try {
        const response = await habiticaApi.put(`/tasks/${taskId}`, fields);
        return response.data.data;
    } catch (error) {
        console.error("Error al actualizar tarea pendiente:", error.response?.data || error.message);
        throw error;
    }
}

export async function completeTodo(taskId) {
    try {
        const response = await habiticaApi.post(`/tasks/${taskId}/score/up`);
        return response.data.data;
    } catch (error) {
        console.error("Error al completar tarea pendiente:", error.response?.data || error.message);
        throw error;
    }
}