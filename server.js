const express = require('express');
const sqlite3 = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',          // your MySQL password
  database: 'client_db'  // database name
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});


db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    nrc TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST /api/clients – create new client
app.post('/api/clients', (req, res) => {
    const { firstName, lastName, nrc, phone, email } = req.body;
  
    if (!firstName || !lastName || !nrc || !phone) {
      return res.status(400).json({
        message: 'First name, last name, NRC, and phone are required'
      });
    }
  
    const checkSql = `SELECT id FROM clients WHERE nrc = ?`;
  
    db.get(checkSql, [nrc], (err, row) => {
      if (row) {
        return res.status(400).json({
          message: 'Client with this NRC already exists'
        });
      }
  
      const insertSql = `
        INSERT INTO clients (first_name, last_name, nrc, phone, email)
        VALUES (?, ?, ?, ?, ?)
      `;
  
      db.run(
        insertSql,
        [firstName, lastName, nrc, phone, email],
        function (err) {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
  
          res.status(201).json({
            id: this.lastID,
            message: 'Client registered successfully'
          });
        }
      );
    });
  });
  

// GET /api/clients – fetch all clients
app.get('/api/clients', (req, res) => {
  db.all(`SELECT * FROM clients`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    res.status(200).json(rows);
  });
});

// GET /api/clients/:id – fetch single client
app.get('/api/clients/:id', (req, res) => {
  db.get(
    `SELECT * FROM clients WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.status(200).json(row);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
