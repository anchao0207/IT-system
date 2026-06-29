# Computech Ops

A self-hosted IT operations app for equipment inventory, client ticketing, and admin time/mileage tracking.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- shadcn/ui-style components
- Auth.js with Microsoft Entra ID
- Baserow REST API as the backend/database
- Docker Compose for local server deployment

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in the Auth.js Microsoft Entra values.
3. Start Baserow and create the tables listed in `docs/baserow-schema.md`.
4. Create a Baserow database token with access to those tables.
5. Add the table IDs and token to `.env`.
6. Run `npm.cmd run dev`.

## Docker

```powershell
docker compose up --build
```

The app runs on `http://localhost:3000`; Baserow runs on `http://localhost:8080`.
