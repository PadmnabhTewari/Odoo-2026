# AssetFlow

Enterprise Asset & Resource Management System.
# Working Prototype: https://odoo-2026-ki0q.onrender.com/
## Product Goal

AssetFlow helps organizations track assets, allocate shared resources, manage maintenance, run audits, and surface overdue items from one centralized ERP-style workflow.

## Build Plan

### Phase 1: Foundation

1. Establish the monorepo structure for the client and server.
2. Define the domain model in Prisma for departments, employees, assets, bookings, maintenance, audits, notifications, and logs.
3. Scaffold the API with health and overview endpoints so the frontend can render live data.
4. Build the frontend shell with a dashboard, navigation, and mock operational widgets.

### Phase 2: Core Workflows

1. Add organization setup screens for departments, asset categories, and employee role promotion.
2. Add asset registration, allocation, transfer, and return flows.
3. Add resource booking with overlap validation.
4. Add maintenance approval and audit cycle workflows.

### Phase 3: Operational Visibility

1. Add activity logs and notifications.
2. Add analytics and reporting views.
3. Connect all screens to persistent data and role-based access rules.

## Architecture

- `server`: Express API + Prisma schema + workflow endpoints.
- `client/src`: React + TypeScript + Tailwind dashboard app.
- `server/prisma/schema.prisma`: canonical domain model for the ERP flows.

## Next Deliverable

The first working slice is a responsive dashboard with overview KPIs and a backend API contract that matches the product vision.

## Local Production Run

1. Set `DATABASE_URL` to a live PostgreSQL connection string, ideally your Neon free database.
2. Build the client and server with `npm run build`.
3. Start the production server with `npm start`.
4. Open `http://localhost:4000` to use the hosted UI and API on the same origin.

## Single Render App + Neon Database

This repository is structured for one Render web service plus one Neon PostgreSQL database.

### What Runs Where

1. Render runs the Node/Express app.
2. The Express app serves the built React frontend from `client/dist`.
3. Neon stores the Prisma data.

### Deploy Steps

1. Create a free Neon project and copy the PostgreSQL connection string.
2. Create a new Render web service from this repo.
3. Set the Render build command to `npm install && npm run build && npx prisma db push --schema server/prisma/schema.prisma`.
4. Set the Render start command to `npm start`.
5. Add environment variables in Render:
	- `DATABASE_URL` = Neon connection string
	- `ADMIN_EMAIL` = your first admin login email
	- `ADMIN_PASSWORD` = a strong password
	- `AUTH_SECRET` = a long random secret
	- `NODE_ENV` = `production`
6. Keep the free plan database on Neon, not inside Render.
7. The build now pushes the Prisma schema to Neon before the server starts.

### Prisma Setup

1. The Prisma datasource is PostgreSQL.
2. Run `npx prisma db push` against the Neon database for the first schema sync.
3. `prisma generate` runs automatically on install through the server `postinstall` script.

### Notes

1. This is the simplest free stack for the current codebase.
2. If you later want separate frontend hosting, you can move the client to Vercel and keep the API on Render.
