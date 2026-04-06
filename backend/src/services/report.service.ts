import prisma from '../config/prisma';

export class ReportService {
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [currentlyParked, spots, todayEntries, todayRevenue, monthRevenue] = await Promise.all([
      prisma.parkingRecord.count({ where: { status: 'parked' } }),
      prisma.parkingSpot.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.parkingRecord.count({
        where: {
          entryTime: { gte: today, lt: tomorrow },
        },
      }),
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: today, lt: tomorrow },
          status: 'completed',
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: firstDayOfMonth, lt: firstDayOfNextMonth },
          status: 'completed',
        },
        _sum: { amount: true },
      }),
    ]);

    const totalSpots = spots.reduce((sum, s) => sum + s._count.id, 0);
    const availableSpots = spots.find((s) => s.status === 'available')?._count.id || 0;
    const occupiedSpots = spots.find((s) => s.status === 'occupied')?._count.id || 0;

    return {
      currentlyParked,
      totalSpots,
      availableSpots,
      occupiedSpots,
      todayEntries,
      todayRevenue: Number(todayRevenue._sum.amount || 0),
      monthRevenue: Number(monthRevenue._sum.amount || 0),
    };
  }

  async getRevenue(from?: string, to?: string, groupBy?: string) {
    const where: any = { status: 'completed' };
    if (from) where.paidAt = { ...where.paidAt, gte: new Date(from) };
    if (to) where.paidAt = { ...where.paidAt, lte: new Date(to + 'T23:59:59.999') };

    // Prisma doesn't support date formatting in groupBy easily,
    // so we use raw query for this complex aggregation
    const payments = await prisma.payment.findMany({
      where,
      select: {
        amount: true,
        paymentType: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const grouped = new Map<string, {
      totalRevenue: number;
      totalTransactions: number;
      parkingRevenue: number;
      packageRevenue: number;
    }>();

    for (const payment of payments) {
      let period: string;
      const date = new Date(payment.paidAt);

      switch (groupBy) {
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          period = `${date.getFullYear()}`;
          break;
        default:
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      const existing = grouped.get(period) || {
        totalRevenue: 0,
        totalTransactions: 0,
        parkingRevenue: 0,
        packageRevenue: 0,
      };

      const amount = Number(payment.amount);
      existing.totalRevenue += amount;
      existing.totalTransactions += 1;
      if (payment.paymentType === 'parking') {
        existing.parkingRevenue += amount;
      } else {
        existing.packageRevenue += amount;
      }

      grouped.set(period, existing);
    }

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      ...data,
    }));
  }

  async getVehicleStats(from?: string, to?: string) {
    const where: any = { status: 'completed' };
    if (from) where.entryTime = { ...where.entryTime, gte: new Date(from) };
    if (to) where.entryTime = { ...where.entryTime, lte: new Date(to + 'T23:59:59.999') };
    if (!from && !to) {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const firstDayOfNextMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 1);
      where.entryTime = { gte: firstDayOfMonth, lt: firstDayOfNextMonth };
    }

    const records = await prisma.parkingRecord.findMany({
      where,
      include: {
        vehicleType: { select: { name: true } },
      },
    });

    const stats = new Map<string, { totalRecords: number; totalFees: number }>();
    for (const record of records) {
      const typeName = record.vehicleType.name;
      const existing = stats.get(typeName) || { totalRecords: 0, totalFees: 0 };
      existing.totalRecords += 1;
      existing.totalFees += Number(record.fee || 0);
      stats.set(typeName, existing);
    }

    return Array.from(stats.entries())
      .map(([vehicleType, data]) => ({ vehicleType, ...data }))
      .sort((a, b) => b.totalRecords - a.totalRecords);
  }

  async getHourlyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await prisma.parkingRecord.findMany({
      where: {
        entryTime: { gte: today, lt: tomorrow },
      },
      select: { entryTime: true },
    });

    const hourlyMap = new Map<number, number>();
    for (const record of records) {
      const hour = new Date(record.entryTime).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    }

    return Array.from(hourlyMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);
  }
}

export const reportService = new ReportService();
