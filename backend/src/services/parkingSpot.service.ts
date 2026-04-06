import prisma from '../config/prisma';
import { CreateParkingSpotInput, UpdateParkingSpotInput } from '../validators/parkingSpot.validator';

export class ParkingSpotService {
  async findAll(zoneId?: number, status?: string) {
    return prisma.parkingSpot.findMany({
      where: {
        ...(zoneId && { zoneId }),
        ...(status && { status }),
      },
      include: {
        zone: { select: { name: true } },
      },
      orderBy: [{ zoneId: 'asc' }, { spotNumber: 'asc' }],
    });
  }

  async create(data: CreateParkingSpotInput) {
    const spot = await prisma.parkingSpot.create({
      data: {
        zoneId: data.zoneId,
        spotNumber: data.spotNumber,
        spotType: data.spotType ?? 'standard',
      },
    });

    return { message: 'Thêm chỗ đỗ thành công', id: spot.id };
  }

  async update(id: number, data: UpdateParkingSpotInput) {
    await prisma.parkingSpot.update({
      where: { id },
      data: {
        spotType: data.spotType ?? 'standard',
        status: data.status ?? 'available',
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    // Gỡ liên kết với các bản ghi đỗ xe trước khi xóa
    await prisma.parkingRecord.updateMany({
      where: { parkingSpotId: id },
      data: { parkingSpotId: null },
    });

    await prisma.parkingSpot.delete({
      where: { id },
    });

    return { message: 'Xóa chỗ đỗ thành công' };
  }
}

export const parkingSpotService = new ParkingSpotService();
