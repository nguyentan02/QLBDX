import prisma from '../config/prisma';
import { CreateVehicleTypeInput, UpdateVehicleTypeInput } from '../validators/vehicleType.validator';

export class VehicleTypeService {
  async findAll() {
    return prisma.vehicleType.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async create(data: CreateVehicleTypeInput) {
    const vehicleType = await prisma.vehicleType.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        monthlyRate: data.monthlyRate,
      },
    });

    return { message: 'Thêm loại xe thành công', id: vehicleType.id };
  }

  async update(id: number, data: UpdateVehicleTypeInput) {
    await prisma.vehicleType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        monthlyRate: data.monthlyRate,
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    const vehicles = await prisma.vehicle.findMany({ where: { vehicleTypeId: id } });
    if (vehicles.length > 0) {
      throw { status: 400, message: `Không thể xóa vì đang có ${vehicles.length} xe thuộc loại này` };
    }

    const packages = await prisma.parkingPackage.findMany({ where: { vehicleTypeId: id } });
    if (packages.length > 0) {
      throw { status: 400, message: `Không thể xóa vì đang có ${packages.length} gói đỗ xe thuộc loại này` };
    }

    await prisma.vehicleType.delete({ where: { id } });
    return { message: 'Xóa loại xe thành công' };
  }
}

export const vehicleTypeService = new VehicleTypeService();
