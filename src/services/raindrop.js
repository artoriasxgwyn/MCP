import { raindropApi } from "../config/client.js";

// ================= COLECCIONES =================

export async function getCollections() {
    try {
        const response = await raindropApi.get("/collections");
        return response.data;
    } catch (error) {
        console.error("Error al obtener colecciones:", error.response?.data || error.message);
        throw error;
    }
}

export async function getChildCollections() {
    try {
        const response = await raindropApi.get("/collections/childrens");
        return response.data;
    } catch (error) {
        console.error("Error al obtener subcolecciones:", error.response?.data || error.message);
        throw error;
    }
}

export async function getCollection(collectionId) {
    try {
        const response = await raindropApi.get(`/collection/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener colección:", error.response?.data || error.message);
        throw error;
    }
}

export async function createCollection({ title, color, view, sort, isPublic, parentId, cover }) {
    try {
        const body = { title };
        // Campos opcionales: solo se envían si vienen definidos
        if (color !== undefined) body.color = color;
        if (view !== undefined) body.view = view;
        if (sort !== undefined) body.sort = sort;
        if (isPublic !== undefined) body.public = isPublic;
        if (parentId !== undefined) body.parent = { "$id": parentId };
        if (cover !== undefined) body.cover = cover;
        const response = await raindropApi.post("/collection", body);
        return response.data;
    } catch (error) {
        console.error("Error al crear colección:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateCollection(collectionId, fields) {
    try {
        const body = { ...fields };
        // El padre viaja como objeto anidado: { "$id": <parentId> }
        if (fields.parentId !== undefined) {
            body.parent = { "$id": fields.parentId };
            delete body.parentId;
        }
        const response = await raindropApi.put(`/collection/${collectionId}`, body);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar colección:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteCollection(collectionId) {
    try {
        const response = await raindropApi.delete(`/collection/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar colección:", error.response?.data || error.message);
        throw error;
    }
}

// ================= RAINDROPS (BOOKMARKS) =================

export async function getRaindrops(collectionId, { search, sort, page, perpage } = {}) {
    try {
        const params = {};
        if (search !== undefined) params.search = search;
        if (sort !== undefined) params.sort = sort;
        if (page !== undefined) params.page = page;
        if (perpage !== undefined) params.perpage = perpage;
        const response = await raindropApi.get(`/raindrops/${collectionId}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error al obtener raindrops:", error.response?.data || error.message);
        throw error;
    }
}

export async function getRaindrop(raindropId) {
    try {
        const response = await raindropApi.get(`/raindrop/${raindropId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener raindrop:", error.response?.data || error.message);
        throw error;
    }
}

export async function createRaindrop({ link, title, collectionId, tags, excerpt, note, important, order, pleaseParse }) {
    try {
        const body = { link };
        // Campos opcionales: solo se envían si vienen definidos
        if (title !== undefined) body.title = title;
        if (collectionId !== undefined) body.collection = { "$id": collectionId };
        if (tags !== undefined) body.tags = tags;
        if (excerpt !== undefined) body.excerpt = excerpt;
        if (note !== undefined) body.note = note;
        if (important !== undefined) body.important = important;
        if (order !== undefined) body.order = order;
        // Objeto vacío = la API parsea metadatos (cover, descripción) en segundo plano
        if (pleaseParse) body.pleaseParse = {};
        const response = await raindropApi.post("/raindrop", body);
        return response.data;
    } catch (error) {
        console.error("Error al crear raindrop:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateRaindrop(raindropId, fields) {
    try {
        const body = { ...fields };
        // La colección viaja como objeto anidado: { "$id": <collectionId> }
        if (fields.collectionId !== undefined) {
            body.collection = { "$id": fields.collectionId };
            delete body.collectionId;
        }
        const response = await raindropApi.put(`/raindrop/${raindropId}`, body);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar raindrop:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteRaindrop(raindropId) {
    try {
        const response = await raindropApi.delete(`/raindrop/${raindropId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar raindrop:", error.response?.data || error.message);
        throw error;
    }
}

// ================= TAGS =================

export async function getTags() {
    try {
        const response = await raindropApi.get("/tags");
        return response.data;
    } catch (error) {
        console.error("Error al obtener tags:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteTag(tag) {
    try {
        const response = await raindropApi.delete(`/tags/${encodeURIComponent(tag)}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar tag:", error.response?.data || error.message);
        throw error;
    }
}

// ================= HIGHLIGHTS Y STATS =================

export async function getHighlights(collectionId) {
    try {
        const response = await raindropApi.get(`/highlights/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener highlights:", error.response?.data || error.message);
        throw error;
    }
}

export async function getUserStats() {
    try {
        const response = await raindropApi.get("/user/stats");
        return response.data;
    } catch (error) {
        console.error("Error al obtener estadísticas del usuario:", error.response?.data || error.message);
        throw error;
    }
}