import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
export function signToken(userId, role) {
    return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export async function hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
}
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
