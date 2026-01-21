# Client Registration & Loan Enquiry System

## Description
A simple web application for registering clients and viewing registered records.
Built as an entry/junior developer assessment.

## Tech Stack
- Node.js
- Express
- SQLite
- HTML/CSS/JavaScript

## Setup Instructions

1. Install Node.js
2. Clone repository
3. Install dependencies:
   npm install
4. Start server:
   node server.js
5. Open index.html in browser

## API Endpoints

POST /api/clients  
Creates a new client

GET /api/clients  
Fetch all clients

GET /api/clients/{id}  
Fetch a single client

## Business Rules
- NRC must be unique
- Duplicate NRCs are rejected
- Required fields are validated

## Author
Your Name
