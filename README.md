# AssetFlow

Enterprise Asset & Resource Management System.

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

1. Build the client and server with `npm run build`.
2. Start the production server with `npm start`.
3. Open `http://localhost:4000` to use the hosted UI and API on the same origin.
4. `prisma generate` runs on install now, so hosted builds only need the compile step.

## Online Hosting

Recommended setup:

1. Deploy as one Node service so the Express server serves both the API and the built React app.
2. Set `NODE_ENV=production`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `CORS_ORIGIN`.
3. Run `npm run build` during deploy, then `npm start` as the launch command.
4. If you want a separate frontend host later, set `VITE_API_BASE_URL` on the client deployment and keep the API service on a stable public URL.

If you want the cleanest online deployment path, the next step is to add a Dockerfile and a simple render/railway config so the same repo can be pushed straight to a host.
