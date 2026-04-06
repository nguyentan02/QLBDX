import prisma from '../config/prisma';
import { CreateVehicleInput, UpdateVehicleInput } from '../validators/vehicle.validator';

export class VehicleService {
  async findAll(search?: string, customerId?: number) {
    return prisma.vehicle.findMany({
      where: {
        ...(search && {
          OR: [
            { licensePlate: { contains: search } },
            { customer: { fullName: { contains: search } } },
          ],
        }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: { select: { fullName: true } },
        vehicleType: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPlate(plate: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: plate },
      include: {
        customer: { select: { fullName: true } },
        vehicleType: { select: { name: true } },
      },
    });

    if (!vehicle) {
      throw { status: 404, message: 'Không tìm thấy xe' };
    }

    return vehicle;
  }

  async findById(id: number) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: { select: { fullName: true } },
        vehicleType: { select: { name: true } },
      },
    });

    if (!vehicle) {
      throw { status: 404, message: 'Không tìm thấy xe' };
    }

    return vehicle;
  }

  async create(data: CreateVehicleInput) {
    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: data.licensePlate },
    });

    if (existing) {
      throw { status: 400, message: 'Biển số xe đã tồn tại' };
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: data.customerId,
        vehicleTypeId: data.vehicleTypeId,
        licensePlate: data.licensePlate,
        brand: data.brand ?? null,
        model: data.model ?? null,
        color: data.color ?? null,
      },
    });

    return { message: 'Thêm xe thành công', id: vehicle.id };
  }

  async update(id: number, data: UpdateVehicleInput) {
    await prisma.vehicle.update({
      where: { id },
      data: {
        customerId: data.customerId,
        vehicleTypeId: data.vehicleTypeId,
        licensePlate: data.licensePlate,
        brand: data.brand ?? null,
        model: data.model ?? null,
        color: data.color ?? null,
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    await prisma.vehicle.delete({ where: { id } });
    return { message: 'Xóa xe thành công' };
  }
}

export const vehicleService = new VehicleService();
