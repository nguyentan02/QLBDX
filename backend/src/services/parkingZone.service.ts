import prisma from '../config/prisma';
import { CreateParkingZoneInput, UpdateParkingZoneInput } from '../validators/parkingZone.validator';

export class ParkingZoneService {
  async findAll() {
    const zones = await prisma.parkingZone.findMany({
      include: {
        _count: {
          select: { parkingSpots: true },
        },
        parkingSpots: {
          select: { status: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
      totalSpots: zone._count.parkingSpots,
      availableSpots: zone.parkingSpots.filter((s) => s.status === 'available').length,
      occupiedSpots: zone.parkingSpots.filter((s) => s.status === 'occupied').length,
      createdAt: zone.createdAt,
    }));
  }

  async create(data: CreateParkingZoneInput) {
    const zone = await prisma.parkingZone.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });

    return { message: 'Thêm khu vực thành công', id: zone.id };
  }

  async update(id: number, data: UpdateParkingZoneInput) {
    await prisma.parkingZone.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    // Gỡ liên kết parking records với các spots trong zone
    const spotIds = await prisma.parkingSpot.findMany({
      where: { zoneId: id },
      select: { id: true },
    });

    if (spotIds.length > 0) {
      await prisma.parkingRecord.updateMany({
        where: { parkingSpotId: { in: spotIds.map(s => s.id) } },
        data: { parkingSpotId: null },
      });
    }

    // Delete all spots in this zone first
    await prisma.parkingSpot.deleteMany({
      where: { zoneId: id },
    });

    await prisma.parkingZone.delete({
      where: { id },
    });

    return { message: 'Xóa khu vực thành công' };
  }
}

export const parkingZoneService = new ParkingZoneService();
