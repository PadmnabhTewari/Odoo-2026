import { prisma } from '../lib/prisma.js';
import { comparePassword, createSessionToken, hashPassword, hashSessionToken } from '../lib/security.js';
const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;
function publicEmployee(employee) {
    return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        departmentId: employee.departmentId
    };
}
async function issueSession(employeeId) {
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + sessionDurationMs);
    await prisma.session.create({
        data: {
            employeeId,
            tokenHash: hashSessionToken(token),
            expiresAt
        }
    });
    return { token, expiresAt };
}
export function registerAuthRoutes(app) {
    app.post('/api/auth/signup', async (request, response) => {
        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            response.status(400).json({ message: 'Name, email, and password are required.' });
            return;
        }
        const existing = await prisma.employee.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            response.status(409).json({ message: 'An employee with this email already exists.' });
            return;
        }
        const employee = await prisma.employee.create({
            data: {
                name,
                email: email.toLowerCase(),
                passwordHash: await hashPassword(password),
                role: 'EMPLOYEE',
                status: 'ACTIVE'
            }
        });
        const session = await issueSession(employee.id);
        response.status(201).json({
            employee: publicEmployee(employee),
            token: session.token,
            expiresAt: session.expiresAt.toISOString()
        });
    });
    app.post('/api/auth/login', async (request, response) => {
        const { email, password } = request.body;
        if (!email || !password) {
            response.status(400).json({ message: 'Email and password are required.' });
            return;
        }
        const employee = await prisma.employee.findUnique({ where: { email: email.toLowerCase() } });
        if (!employee) {
            response.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        const isValid = await comparePassword(password, employee.passwordHash);
        if (!isValid) {
            response.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        const session = await issueSession(employee.id);
        response.json({
            employee: publicEmployee(employee),
            token: session.token,
            expiresAt: session.expiresAt.toISOString()
        });
    });
    app.post('/api/auth/logout', async (request, response) => {
        const authorization = request.header('authorization');
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
        if (token) {
            await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
        }
        response.json({ ok: true });
    });
    app.get('/api/auth/me', async (request, response) => {
        const authorization = request.header('authorization');
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
        if (!token) {
            response.status(401).json({ message: 'Not authenticated.' });
            return;
        }
        const session = await prisma.session.findUnique({
            where: { tokenHash: hashSessionToken(token) },
            include: { employee: true }
        });
        if (!session || session.expiresAt.getTime() < Date.now()) {
            response.status(401).json({ message: 'Session expired.' });
            return;
        }
        response.json({ employee: publicEmployee(session.employee), expiresAt: session.expiresAt.toISOString() });
    });
}
