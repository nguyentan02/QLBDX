import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { ParkingEntryInput, ParkingExitInput } from '../validators/parking.validator';

export class ParkingService {
  async findAll(status?: string) {
    return prisma.parkingRecord.findMany({
      where: {
        status: status || 'parked',
      },
      include: {
        vehicleType: { select: { name: true } },
        parkingSpot: {
          select: {
            spotNumber: true,
            zone: { select: { name: true } },
          },
        },
        vehicle: {
          select: {
            brand: true,
            model: true,
            color: true,
            customer: { select: { fullName: true } },
          },
        },
      },
      orderBy: { entryTime: 'desc' },
    });
  }

  async entry(data: ParkingEntryInput, createdByUserId: number) {
    // Check if vehicle is already parked
    const alreadyParked = await prisma.parkingRecord.findFirst({
      where: { licensePlate: data.licensePlate, status: 'parked' },
    });

    if (alreadyParked) {
      throw { status: 400, message: 'Xe này đang đỗ trong bãi' };
    }

    // Check if the entire lot is full (has spots configured but none available)
    const [totalSpots, availableSpots] = await Promise.all([
      prisma.parkingSpot.count(),
      prisma.parkingSpot.count({ where: { status: 'available' } }),
    ]);

    if (totalSpots > 0 && availableSpots === 0) {
      throw { status: 400, message: 'Bãi đỗ xe đã đầy, không thể nhận thêm xe' };
    }

    // If a specific spot was requested, verify it is still available
    if (data.parkingSpotId) {
      const spot = await prisma.parkingSpot.findUnique({
        where: { id: data.parkingSpotId },
        select: { status: true, spotNumber: true },
      });
      if (!spot || spot.status !== 'available') {
        throw { status: 400, message: `Chỗ đỗ này đã được sử dụng hoặc không khả dụng` };
      }
    }

    // Check if vehicle exists in system
    const vehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: data.licensePlate },
    });

    const record = await prisma.parkingRecord.create({
      data: {
        vehicleId: vehicle?.id ?? null,
        licensePlate: data.licensePlate,
        vehicleTypeId: data.vehicleTypeId,
        parkingSpotId: data.parkingSpotId ?? null,
        notes: data.notes ?? null,
        createdBy: createdByUserId,
      },
    });

    // Update parking spot status
    if (data.parkingSpotId) {
      await prisma.parkingSpot.update({
        where: { id: data.parkingSpotId },
        data: { status: 'occupied' },
      });
    }

    return { message: 'Ghi nhận xe vào thành công', id: record.id };
  }

  async exit(data: ParkingExitInput, createdByUserId: number) {
    const record = await prisma.parkingRecord.findFirst({
      where: { id: data.parkingRecordId, status: 'parked' },
      include: {
        vehicleType: { select: { hourlyRate: true, dailyRate: true } },
      },
    });

    if (!record) {
      throw { status: 404, message: 'Không tìm thấy bản ghi' };
    }

    const entryTime = new Date(record.entryTime);
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    // Check if vehicle has active package
    let fee = 0;
    let hasPackage = false;

    if (record.vehicleId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pkgCheck = await prisma.customerPackage.findFirst({
        where: {
          vehicleId: record.vehicleId,
          status: 'active',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });
      hasPackage = !!pkgCheck;
    }

    if (!hasPackage) {
      const hourlyRate = Number(record.vehicleType.hourlyRate);
      const dailyRate = Number(record.vehicleType.dailyRate);

      if (durationHours <= 24) {
        fee = Math.min(durationHours * hourlyRate, dailyRate);
      } else {
        const days = Math.ceil(durationHours / 24);
        fee = days * dailyRate;
      }
    }

    // Update parking record
    await prisma.parkingRecord.update({
      where: { id: data.parkingRecordId },
      data: {
        exitTime,
        duration: durationMinutes,
        fee: new Decimal(fee),
        status: 'completed',
      },
    });

    // Free up parking spot
    if (record.parkingSpotId) {
      await prisma.parkingSpot.update({
        where: { id: record.parkingSpotId },
        data: { status: 'available' },
      });
    }

    // Create payment record
    if (fee > 0) {
      await prisma.payment.create({
        data: {
          parkingRecordId: data.parkingRecordId,
          amount: new Decimal(fee),
          paymentMethod: data.paymentMethod || 'cash',
          paymentType: 'parking',
          createdBy: createdByUserId,
        },
      });
    }

    return {
      message: 'Ghi nhận xe ra thành công',
      data: {
        entryTime,
        exitTime,
        durationMinutes,
        fee,
        hasPackage,
      },
    };
  }

  async preview(parkingRecordId: number) {
    const record = await prisma.parkingRecord.findFirst({
      where: { id: parkingRecordId, status: 'parked' },
      include: {
        vehicleType: { select: { hourlyRate: true, dailyRate: true } },
      },
    });

    if (!record) {
      throw { status: 404, message: 'Không tìm thấy bản ghi' };
    }

    const entryTime = new Date(record.entryTime);
    const now = new Date();
    const durationMs = now.getTime() - entryTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    let fee = 0;
    let hasPackage = false;
    let packageEndDate: Date | null = null;
    let daysUntilExpiry: number | null = null;

    if (record.vehicleId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pkgCheck = await prisma.customerPackage.findFirst({
        where: {
          vehicleId: record.vehicleId,
          status: 'active',
          startDate: { lte: today },
          endDate: { gte: today },
        },
        orderBy: { endDate: 'asc' },
      });
      hasPackage = !!pkgCheck;
      if (pkgCheck) {
        packageEndDate = new Date(pkgCheck.endDate);
        daysUntilExpiry = Math.ceil(
          (packageEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    if (!hasPackage) {
      const hourlyRate = Number(record.vehicleType.hourlyRate);
      const dailyRate = Number(record.vehicleType.dailyRate);
      if (durationHours <= 24) {
        fee = Math.min(durationHours * hourlyRate, dailyRate);
      } else {
        const days = Math.ceil(durationHours / 24);
        fee = days * dailyRate;
      }
    }

    return { fee, hasPackage, durationMinutes, packageEndDate, daysUntilExpiry };
  }

  async history(from?: string, to?: string, licensePlate?: string) {
    return prisma.parkingRecord.findMany({
      where: {
        status: 'completed',
        ...(from && { entryTime: { gte: new Date(from) } }),
        ...(to && { entryTime: { lte: new Date(to) } }),
        ...(licensePlate && { licensePlate: { contains: licensePlate } }),
      },
      include: {
        vehicleType: { select: { name: true } },
        parkingSpot: {
          select: {
            spotNumber: true,
            zone: { select: { name: true } },
          },
        },
      },
      orderBy: { exitTime: 'desc' },
    });
  }
}

export const parkingService = new ParkingService();
