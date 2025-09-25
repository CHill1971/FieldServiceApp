import { Router, type Request, type Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const techniciansRouter = Router();

techniciansRouter.use(requireAuth);

techniciansRouter.get('/me/assignments', requireRole(['TECHNICIAN']), async (req: Request, res: Response) => {
  const list = await prisma.workOrder.findMany({ where: { assignedTechId: req.user!.id }, orderBy: { scheduledAt: 'asc' } });
  res.json(list);
});