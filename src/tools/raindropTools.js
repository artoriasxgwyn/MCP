import { z } from "zod";
import {
    getCollections, getChildCollections, getCollection, createCollection, updateCollection, deleteCollection,
    getRaindrops, getRaindrop, createRaindrop, updateRaindrop, deleteRaindrop,
    getTags, deleteTag,
    getHighlights, getUserStats
} from "../services/raindrop.js";

/**
 * Registra todas las herramientas de Raindrop en el servidor MCP.
 * Cada herramienta define su esquema (Zod) y delega la lógica
 * al servicio correspondiente.
 *
 * Colecciones especiales (IDs de sistema):
 *   0   = todos los bookmarks excepto la papelera
 *   -1  = "Unsorted" (sin clasificar)
 *   -99 = papelera
 */
export function registerRaindropTools(server) {

    // ================= COLECCIONES =================

    server.registerTool(
        "rd_get_collections",
        {
            description: "Obtiene todas las colecciones raíz del usuario en Raindrop",
            inputSchema: {}
        },
        async () => {
            try {
                const collections = await getCollections();
                return { content: [{ type: "text", text: JSON.stringify(collections, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener colecciones: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_get_child_collections",
        {
            description: "Obtiene todas las subcolecciones (anidadas) del usuario en Raindrop",
            inputSchema: {}
        },
        async () => {
            try {
                const children = await getChildCollections();
                return { content: [{ type: "text", text: JSON.stringify(children, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener subcolecciones: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_get_collection",
        {
            description: "Obtiene una colección específica de Raindrop por su ID",
            inputSchema: {
                collection_id: z.number().describe("El ID de la colección")
            }
        },
        async ({ collection_id }) => {
            try {
                const response = await getCollection(collection_id);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener colección: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_create_collection",
        {
            description: "Crea una nueva colección en Raindrop",
            inputSchema: {
                title: z.string().describe("Nombre de la colección"),
                color: z.string().optional().describe("Color de la portada en HEX (ej: '#ff0000')"),
                view: z.enum(["list", "simple", "grid", "masonry"]).optional().describe("Vista de la colección (por defecto 'list')"),
                sort: z.number().optional().describe("Posición de ordenación entre colecciones hermanas (descendente)"),
                is_public: z.boolean().optional().describe("Si la colección es accesible por enlace público"),
                parent_id: z.number().optional().describe("ID de la colección padre (omitir para colección raíz)"),
                cover: z.array(z.string()).optional().describe("URLs de portada para la colección")
            }
        },
        async (args) => {
            try {
                const response = await createCollection({
                    title: args.title,
                    color: args.color,
                    view: args.view,
                    sort: args.sort,
                    isPublic: args.is_public,
                    parentId: args.parent_id,
                    cover: args.cover
                });
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al crear colección: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_update_collection",
        {
            description: "Actualiza una colección existente de Raindrop",
            inputSchema: {
                collection_id: z.number().describe("ID de la colección"),
                title: z.string().optional().describe("Nuevo nombre"),
                color: z.string().optional().describe("Nuevo color en HEX"),
                view: z.enum(["list", "simple", "grid", "masonry"]).optional(),
                sort: z.number().optional().describe("Posición de ordenación entre colecciones hermanas"),
                public: z.boolean().optional().describe("Si la colección es accesible por enlace público"),
                expanded: z.boolean().optional().describe("Si las subcolecciones se muestran expandidas"),
                parent_id: z.number().optional().describe("ID de la nueva colección padre"),
                cover: z.array(z.string()).optional().describe("Nuevas URLs de portada")
            }
        },
        async ({ collection_id, ...fields }) => {
            try {
                // Renombrar parent_id → parentId, que es lo que espera el servicio
                if (fields.parent_id !== undefined) {
                    fields.parentId = fields.parent_id;
                    delete fields.parent_id;
                }
                const response = await updateCollection(collection_id, fields);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al actualizar colección: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_delete_collection",
        {
            description: "Elimina una colección de Raindrop. Borra también sus subcolecciones; los raindrops van a la papelera.",
            inputSchema: {
                collection_id: z.number().describe("ID de la colección a eliminar")
            }
        },
        async ({ collection_id }) => {
            try {
                const response = await deleteCollection(collection_id);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al eliminar colección: ${error.message}` }] };
            }
        }
    );

    // ================= RAINDROPS (BOOKMARKS) =================

    server.registerTool(
        "rd_get_raindrops",
        {
            description: "Obtiene los raindrops (bookmarks) de una colección. Usa collection_id=0 para buscar en todos, -1 para 'Unsorted' y -99 para la papelera. Soporta búsqueda de texto, orden y paginación.",
            inputSchema: {
                collection_id: z.number().default(0).describe("ID de la colección (0 = todos, -1 = Unsorted, -99 = papelera)"),
                search: z.string().optional().describe("Texto a buscar (título, descripción, tags, URL)"),
                sort: z.enum(["-created", "created", "score", "-sort", "title", "-title", "domain", "-domain"]).optional().describe("Orden de los resultados (por defecto '-created', los más recientes primero)"),
                page: z.number().optional().describe("Número de página (empieza en 0)"),
                perpage: z.number().optional().describe("Resultados por página (máximo 50)")
            }
        },
        async ({ collection_id, ...params }) => {
            try {
                const response = await getRaindrops(collection_id, params);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener raindrops: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_search_raindrops",
        {
            description: "Busca raindrops (bookmarks) en Raindrop por texto. Busca en todas las colecciones excepto la papelera.",
            inputSchema: {
                search: z.string().describe("Texto a buscar (título, descripción, tags, URL)"),
                page: z.number().optional().describe("Número de página (empieza en 0)"),
                perpage: z.number().optional().describe("Resultados por página (máximo 50)")
            }
        },
        async ({ search, ...params }) => {
            try {
                const response = await getRaindrops(0, { search, ...params });
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al buscar raindrops: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_get_raindrop",
        {
            description: "Obtiene un raindrop (bookmark) específico por su ID",
            inputSchema: {
                raindrop_id: z.number().describe("El ID del raindrop")
            }
        },
        async ({ raindrop_id }) => {
            try {
                const response = await getRaindrop(raindrop_id);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener raindrop: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_create_raindrop",
        {
            description: "Crea un nuevo raindrop (bookmark) en Raindrop a partir de una URL",
            inputSchema: {
                link: z.string().describe("La URL del bookmark (obligatoria)"),
                title: z.string().optional().describe("Título del bookmark (si se omite, la API lo extrae de la página)"),
                collection_id: z.number().optional().describe("ID de la colección destino (omitir para 'Unsorted')"),
                tags: z.array(z.string()).optional().describe("Tags a asignar"),
                excerpt: z.string().optional().describe("Extracto o descripción (máximo 10000 caracteres)"),
                note: z.string().optional().describe("Nota personal (máximo 10000 caracteres)"),
                important: z.boolean().optional().describe("Marca el bookmark como favorito"),
                order: z.number().optional().describe("Posición ascendente dentro de la colección (0 = primero)"),
                please_parse: z.boolean().optional().describe("Si es true, la API parsea metadatos de la URL (cover, descripción, html) en segundo plano")
            }
        },
        async (args) => {
            try {
                const response = await createRaindrop({
                    link: args.link,
                    title: args.title,
                    collectionId: args.collection_id,
                    tags: args.tags,
                    excerpt: args.excerpt,
                    note: args.note,
                    important: args.important,
                    order: args.order,
                    pleaseParse: args.please_parse
                });
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al crear raindrop: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_update_raindrop",
        {
            description: "Actualiza un raindrop (bookmark) existente",
            inputSchema: {
                raindrop_id: z.number().describe("ID del raindrop"),
                title: z.string().optional().describe("Nuevo título"),
                excerpt: z.string().optional().describe("Nuevo extracto o descripción"),
                note: z.string().optional().describe("Nueva nota personal"),
                tags: z.array(z.string()).optional().describe("Nuevos tags (reemplazan los existentes)"),
                important: z.boolean().optional().describe("Marca como favorito"),
                collection_id: z.number().optional().describe("ID de la colección destino (mueve el raindrop)"),
                cover: z.string().optional().describe("Nueva URL de portada")
            }
        },
        async ({ raindrop_id, collection_id, ...fields }) => {
            try {
                if (collection_id !== undefined) fields.collectionId = collection_id;
                const response = await updateRaindrop(raindrop_id, fields);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al actualizar raindrop: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_delete_raindrop",
        {
            description: "Elimina un raindrop de Raindrop (va a la papelera; desde la papelera se borra definitivamente)",
            inputSchema: {
                raindrop_id: z.number().describe("El ID del raindrop a eliminar")
            }
        },
        async ({ raindrop_id }) => {
            try {
                const response = await deleteRaindrop(raindrop_id);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al eliminar raindrop: ${error.message}` }] };
            }
        }
    );

    // ================= TAGS =================

    server.registerTool(
        "rd_get_tags",
        {
            description: "Obtiene todos los tags del usuario en Raindrop con su contador de uso",
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
        "rd_delete_tag",
        {
            description: "Elimina un tag de todos los raindrops del usuario en Raindrop",
            inputSchema: {
                tag: z.string().describe("El nombre del tag a eliminar")
            }
        },
        async ({ tag }) => {
            try {
                const response = await deleteTag(tag);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al eliminar tag: ${error.message}` }] };
            }
        }
    );

    // ================= HIGHLIGHTS Y STATS =================

    server.registerTool(
        "rd_get_highlights",
        {
            description: "Obtiene los highlights (subrayados) de los raindrops de una colección",
            inputSchema: {
                collection_id: z.number().default(0).describe("ID de la colección (0 = todos, -1 = Unsorted, -99 = papelera)")
            }
        },
        async ({ collection_id }) => {
            try {
                const response = await getHighlights(collection_id);
                return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener highlights: ${error.message}` }] };
            }
        }
    );

    server.registerTool(
        "rd_get_user_stats",
        {
            description: "Obtiene las estadísticas del usuario en Raindrop (incluye contadores de las colecciones de sistema: todos, Unsorted, papelera)",
            inputSchema: {}
        },
        async () => {
            try {
                const stats = await getUserStats();
                return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error al obtener estadísticas: ${error.message}` }] };
            }
        }
    );
}