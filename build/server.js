import cors from "cors";
import express from "express";
import { Pool } from "pg";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const app = express();
const port = Number(process.env.PORT ?? 3000);
const staticDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const db = new Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "200525",
    database: process.env.DB_NAME ?? "client_db",
});
app.use(cors());
app.use(express.json());
app.use(express.static(staticDirectory));
app.post("/api/clients", async (req, res) => {
    const firstName = req.body.firstName?.trim();
    const lastName = req.body.lastName?.trim();
    const nrc = req.body.nrc?.trim();
    const phone = req.body.phone?.trim();
    const email = req.body.email?.trim() || null;
    if (!firstName || !lastName || !nrc || !phone) {
        res.status(400).json({
            message: "First name, last name, NRC, and phone are required",
        });
        return;
    }
    try {
        const existing = await db.query("SELECT id FROM clients WHERE nrc = $1", [
            nrc,
        ]);
        if (existing.rowCount) {
            res.status(400).json({ message: "Client with this NRC already exists" });
            return;
        }
        const result = await db.query(`INSERT INTO clients (first_name, last_name, nrc, phone, email)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`, [firstName, lastName, nrc, phone, email]);
        res.status(201).json({
            id: result.rows[0].id,
            message: "Client registered successfully",
        });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505") {
            res.status(400).json({ message: "Client with this NRC already exists" });
            return;
        }
        console.error("Failed to register client:", error);
        res.status(500).json({ message: "Unable to register client" });
    }
});
app.get("/api/clients", async (_req, res) => {
    try {
        const result = await db.query(`SELECT id, first_name, last_name, nrc, phone, email, created_at
       FROM clients ORDER BY created_at DESC`);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error("Failed to load clients:", error);
        res.status(500).json({ message: "Unable to load clients" });
    }
});
app.get("/api/clients/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ message: "Client ID must be a positive integer" });
        return;
    }
    try {
        const result = await db.query(`SELECT id, first_name, last_name, nrc, phone, email, created_at
         FROM clients WHERE id = $1`, [id]);
        if (!result.rowCount) {
            res.status(404).json({ message: "Client not found" });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error("Failed to load client:", error);
        res.status(500).json({ message: "Unable to load client" });
    }
});
async function startServer() {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        nrc VARCHAR(50) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error("Database connection or table initialization failed:", error);
        process.exitCode = 1;
        await db.end();
    }
}
void startServer();
