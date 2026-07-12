import { getAuthenticatedEmployee } from '../lib/auth.js';
import { hasAnyRole } from '../lib/roles.js';
export async function requireAuth(request, response, next) {
    const employee = await getAuthenticatedEmployee(request);
    if (!employee) {
        response.status(401).json({ message: 'Not authenticated.' });
        return;
    }
    request.employee = employee;
    next();
}
export function requireRoles(...allowedRoles) {
    return (request, response, next) => {
        const employee = request.employee;
        if (!employee) {
            response.status(401).json({ message: 'Not authenticated.' });
            return;
        }
        if (!hasAnyRole(employee.role, allowedRoles)) {
            response.status(403).json({ message: 'You do not have permission to access this resource.' });
            return;
        }
        next();
    };
}
