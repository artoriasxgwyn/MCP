import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// 1. Calcula la ruta absoluta hacia la raíz del proyecto desde src/config/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Carga el .env de forma segura sin importar quién importe este archivo o desde dónde se corra
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Cliente HTTP centralizado para la API de Habitica.
// Centraliza aquí las credenciales y cabeceras de autenticación.
export const habiticaApi = axios.create({
    baseURL: "https://habitica.com/api/v3/",
    headers: {
        "x-api-user": process.env.user_id,
        "x-api-key": process.env.tokenH,
        "x-client": `${process.env.user_id}-mi-app`
    }
});

export const raindropApi = axios.create({
    baseURL: "https://api.raindrop.io/rest/v1/",
    headers: {
        "Authorization": `Bearer ${process.env.tokenR}`
    }
});
