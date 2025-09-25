import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
export const workordersRouter = Router();
workordersRouter.use(requireAuth);
// List work orders - tech sees own, others see all
workordersRouter.get('/', async (req, res) => {
    const isTech = req.user?.role === 'TECHNICIAN';
    const where = isTech ? { assignedTechId: req.user?.id } : {};
    const list = await prisma.workOrder.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(list);
});
// Create work order
workordersRouter.post('/', async (req, res) => {
    const { customerId, location, problemDescription, priority, scheduledAt, assignedTechId } = req.body ?? {};
    if (!customerId || !location || !problemDescription || !priority) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    const jobId = `JOB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const wo = await prisma.workOrder.create({
        data: {
            jobId,
            customerId,
            location,
            problemDescription,
            priority,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            status: 'created',
            assignedTechId: assignedTechId ?? null
        }
    });
    res.status(201).json(wo);
});
workordersRouter.get('/:id', async (req, res) => {
    const wo = await prisma.workOrder.findUnique({
        where: { id: req.params.id },
        include: { items: true, attachments: true, workLogs: true, signature: true, invoice: true }
    });
    if (!wo) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    if (req.user?.role === 'TECHNICIAN' && wo.assignedTechId !== req.user.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    res.json(wo);
});
// Update status
workordersRouter.put('/:id/status', async (req, res) => {
    const { status } = req.body ?? {};
    const allowed = ['created', 'assigned', 'en_route', 'on_site', 'done', 'closed'];
    if (!allowed.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
    }
    const wo = await prisma.workOrder.update({ where: { id: req.params.id }, data: { status } });
    res.json(wo);
});
// Check-in
workordersRouter.post('/:id/checkin', async (req, res) => {
    const now = new Date();
    const gps = req.body?.gps ?? null;
    const workOrderId = req.params.id;
    const techId = req.user.id;
    const log = await prisma.workLog.create({ data: { workOrderId, techId, startedAt: now, note: 'check-in', gps } });
    await prisma.workOrder.update({ where: { id: workOrderId }, data: { status: 'on_site' } });
    res.status(201).json(log);
});
// Check-out
workordersRouter.post('/:id/checkout', async (req, res) => {
    const now = new Date();
    const gps = req.body?.gps ?? null;
    const workOrderId = req.params.id;
    const techId = req.user.id;
    const last = await prisma.workLog.findFirst({ where: { workOrderId, techId, endedAt: null }, orderBy: { startedAt: 'desc' } });
    let log;
    if (last) {
        log = await prisma.workLog.update({ where: { id: last.id }, data: { endedAt: now, note: 'check-out', gps } });
    }
    else {
        log = await prisma.workLog.create({ data: { workOrderId, techId, startedAt: now, endedAt: now, note: 'check-out', gps } });
    }
    await prisma.workOrder.update({ where: { id: workOrderId }, data: { status: 'done' } });
    res.status(201).json(log);
});
// Add item line
workordersRouter.post('/:id/items', async (req, res) => {
    const { itemId, qty, priceOverride } = req.body ?? {};
    if (!itemId || !qty) {
        res.status(400).json({ error: 'itemId and qty required' });
        return;
    }
    const row = await prisma.workOrderItem.create({ data: { workOrderId: req.params.id, itemId, qty, priceOverride } });
    res.status(201).json(row);
});
// Upload photo (expects pre-signed URL flow in future)
workordersRouter.post('/:id/photos', async (req, res) => {
    const { url, meta } = req.body ?? {};
    if (!url) {
        res.status(400).json({ error: 'url required' });
        return;
    }
    const att = await prisma.attachment.create({ data: { workOrderId: req.params.id, type: 'photo', url, meta } });
    res.status(201).json(att);
});
// Capture signature (image already uploaded), save record
workordersRouter.post('/:id/signature', async (req, res) => {
    const { signedBy, imageUrl } = req.body ?? {};
    if (!signedBy || !imageUrl) {
        res.status(400).json({ error: 'signedBy and imageUrl required' });
        return;
    }
    const sig = await prisma.signature.upsert({
        where: { workOrderId: req.params.id },
        update: { signedBy, imageUrl, signedAt: new Date() },
        create: { workOrderId: req.params.id, signedBy, imageUrl, signedAt: new Date() }
    });
    res.status(201).json(sig);
});
