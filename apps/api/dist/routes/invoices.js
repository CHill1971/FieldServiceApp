import { Router } from 'express';
import { prisma } from '../prisma.js';
export const invoicesRouter = Router();
invoicesRouter.post('/:workOrderId/generate', async (req, res) => {
    const workOrderId = req.params.workOrderId;
    const items = await prisma.workOrderItem.findMany({ where: { workOrderId }, include: { item: true } });
    const subtotal = items.reduce((sum, row) => sum + Number(row.priceOverride ?? row.item.unitPrice) * row.qty, 0);
    const tax = items.reduce((sum, row) => sum + (row.item.taxable ? Number(row.priceOverride ?? row.item.unitPrice) * row.qty * 0.1 : 0), 0);
    const total = subtotal + tax;
    const pdfUrl = `s3://attachments/invoices/${workOrderId}.pdf`; // TODO: generate and upload PDF
    const inv = await prisma.invoice.upsert({
        where: { workOrderId },
        update: { subtotal, tax, total, pdfUrl, status: 'draft' },
        create: { workOrderId, subtotal, tax, total, pdfUrl, status: 'draft' }
    });
    res.json(inv);
});
