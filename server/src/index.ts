import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/security.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerOverviewRoutes } from './routes/overview.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });
const clientDistPath = path.resolve(currentDirectory, '../../client/dist');

app.use(
	cors({
		origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? true
	})
);
app.use(express.json());

registerAuthRoutes(app);
registerOverviewRoutes(app);

if (existsSync(clientDistPath)) {
	app.use(express.static(clientDistPath));
	app.get('*', (_request, response, next) => {
		if (_request.path.startsWith('/api')) {
			next();
			return;
		}
		response.sendFile(path.join(clientDistPath, 'index.html'));
	});
}

async function seedAdmin() {
	const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@assetflow.local';
	const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@12345';

	const existing = await prisma.employee.findUnique({ where: { email: adminEmail } });
	if (existing) {
		return;
	}

	const department = await prisma.department.upsert({
		where: { code: 'CORP' },
		update: {},
		create: {
			name: 'Corporate',
			code: 'CORP',
			status: 'ACTIVE'
		}
	});

	await prisma.employee.create({
		data: {
			name: 'System Admin',
			email: adminEmail,
			passwordHash: await hashPassword(adminPassword),
			role: 'ADMIN',
			status: 'ACTIVE',
			departmentId: department.id
		}
	});
}

async function start() {
	await prisma.$connect();
	await seedAdmin();

	app.listen(port, () => {
		console.log(`AssetFlow API running on http://localhost:${port}`);
	});
}

start().catch((error) => {
	console.error('Failed to start AssetFlow API', error);
	process.exit(1);
});
