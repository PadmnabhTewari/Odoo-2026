import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
export function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function createSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}
export function hashSessionToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
