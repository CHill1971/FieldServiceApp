import { Router } from 'express';
import { prisma } from '../prisma.js';
import { signToken, verifyPassword } from '../auth.js';
export const authRouter = Router();
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        res.status(400).json({ error: 'email and password required' });
        return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const token = signToken(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
