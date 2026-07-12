import { prisma } from './prisma.js';
import { hashSessionToken } from './security.js';
export async function getAuthenticatedEmployee(request) {
    const header = request.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
        return null;
    }
    const session = await prisma.session.findUnique({
        where: {
            tokenHash: hashSessionToken(token)
        },
        include: {
            employee: true
        }
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
        return null;
    }
    return session.employee;
}
