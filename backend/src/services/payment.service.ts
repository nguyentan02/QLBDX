import prisma from '../config/prisma';

export class PaymentService {
  async findAll(fromDate?: string, toDate?: string, paymentMethod?: string) {
    const paidAt: Record<string, Date> = {};
    if (fromDate) paidAt.gte = new Date(fromDate);
    if (toDate) paidAt.lte = new Date(toDate + 'T23:59:59.999');

    return prisma.payment.findMany({
      where: {
        ...(Object.keys(paidAt).length > 0 && { paidAt }),
        ...(paymentMethod && { paymentMethod }),
      },
      include: {
        creator: { select: { fullName: true } },
        parkingRecord: {
          select: { licensePlate: true, entryTime: true, exitTime: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
  }
}

export const paymentService = new PaymentService();
