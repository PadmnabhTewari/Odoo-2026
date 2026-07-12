import cors from 'cors';
import express from 'express';
import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/security.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerOverviewRoutes } from './routes/overview.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

registerAuthRoutes(app);
registerOverviewRoutes(app);

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
