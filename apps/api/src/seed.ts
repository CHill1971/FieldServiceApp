import { prisma } from './prisma.js';
import { hashPassword } from './auth.js';

async function main() {
  const adminPass = await hashPassword('admin123');
  const techPass = await hashPassword('tech123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', passwordHash: adminPass }
  });

  const tech = await prisma.user.upsert({
    where: { email: 'tech@example.com' },
    update: {},
    create: { name: 'Tech One', email: 'tech@example.com', role: 'TECHNICIAN', passwordHash: techPass }
  });

  await prisma.technician.upsert({
    where: { userId: tech.id },
    update: {},
    create: { userId: tech.id, phone: '+15551234567', certifications: 'HVAC Level 1' }
  });

  const cust = await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: { name: 'Acme Corp' },
    create: { id: 'seed-customer-1', name: 'Acme Corp', contacts: { primary: 'Jane Doe' }, addresses: { billing: '123 Main St' } }
  });

  const item1 = await prisma.item.upsert({
    where: { sku: 'LABOR-HOUR' },
    update: {},
    create: { sku: 'LABOR-HOUR', name: 'Labor (Hour)', unitPrice: 125.00, taxable: false }
  });

  const item2 = await prisma.item.upsert({
    where: { sku: 'PART-ABC' },
    update: {},
    create: { sku: 'PART-ABC', name: 'Widget Part ABC', unitPrice: 45.50, taxable: true }
  });

  for (let i = 1; i <= 3; i++) {
    const wo = await prisma.workOrder.create({
      data: {
        jobId: `JOB-SEED-${i}`,
        customerId: cust.id,
        location: `${i} Elm Street, Springfield`,
        problemDescription: `Unit ${i} not cooling properly`,
        priority: i === 1 ? 'High' : 'Normal',
        scheduledAt: new Date(Date.now() + i * 3600_000),
        status: 'assigned',
        assignedTechId: tech.id
      }
    });

    await prisma.workOrderItem.create({ data: { workOrderId: wo.id, itemId: item1.id, qty: 2 } });
    await prisma.workOrderItem.create({ data: { workOrderId: wo.id, itemId: item2.id, qty: 1 } });
  }

  console.log('Seed complete:', { admin: admin.email, tech: tech.email });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});