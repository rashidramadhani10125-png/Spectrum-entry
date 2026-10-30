const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Database Connection
const db = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '200525', 
    database: 'client_db',
    port: 5432 
});

// Test connection and create table
db.query(`
    CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        nrc VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err, result) => {
    if (err) {
        console.error('Database connection or table creation failed:', err);
    } else {
        console.log('Connected to PostgreSQL and table is ready!');
    }
});

// POST /api/clients - create new client
app.post('/api/clients', (req, res) => {
    const { firstName, lastName, nrc, phone, email } = req.body;

    if (!firstName || !lastName || !nrc || !phone) {
        return res.status(400).json({
        message: "Please fill in the required fields"
        });
    }

    const checkSql = `SELECT id FROM clients WHERE nrc = $1`;

    db.query(checkSql, [nrc], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        if (result.rows.length > 0) { 
            return res.status(400).json({
                message: 'Client with this NRC already exists'
            });
        }

        const insertSql = `
            INSERT INTO clients (first_name, last_name, nrc, phone, email)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;

        // PostgreSQL maps $1 to firstName, $2 to lastName, etc.
        db.query(
            insertSql,
            [firstName, lastName, nrc, phone, email],
            (err, result) => {
                if (err) {
                    console.groupCollapsed("DATABASE ERROR:", err.message);
                    return res.status(400).json({ message: err.message });
                }

                res.status(201).json({
                    id: result.rows[0].id, 
                    message: 'Client registered successfully'
                });
            }
        );
    });
});

// GET /api/clients - fetch all clients
app.get('/api/clients', (req, res) => {
    db.query('SELECT * FROM clients', [], (err, result) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json(result.rows); // Postgres puts data in result.rows
    });
});

// GET /api/clients/:id - fetch single client
app.get('/api/clients/:id', (req, res) => {
    const getOneSql = `SELECT * FROM clients WHERE id = $1`;
    
    db.query(
        getOneSql,
        [req.params.id],
        (err, result) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Client not found' });
            }
            res.status(200).json(result.rows[0]);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});