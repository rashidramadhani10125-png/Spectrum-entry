# Spectrum Client Registration

Client registration app built with React, TypeScript, Express, and PostgreSQL.

## Setup

1. Install packages with `npm install`.
2. Create a PostgreSQL database named `client_db`.
3. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as environment variables for your database.
4. Start the API with `npm run server:dev`.
5. In another terminal, start the React app with `npm run dev`, then open the URL printed by Vite.

The API creates the `clients` table on startup. The database uses the schema in `Database code.sql`.

Run `npm run build` to type-check and create production builds. `npm start` serves the production frontend and API on port 3000.

## API

- `POST /api/clients` registers a client.
- `GET /api/clients` lists clients.
- `GET /api/clients/:id` retrieves one client.

NRC values must be unique. First name, last name, NRC, and phone are required.
