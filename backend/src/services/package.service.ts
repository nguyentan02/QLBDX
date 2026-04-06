import prisma from '../config/prisma';
import { CreatePackageInput, UpdatePackageInput } from '../validators/package.validator';

export class PackageService {
  async findAll() {
    return prisma.parkingPackage.findMany({
      where: { isActive: true },
      include: {
        vehicleType: { select: { name: true } },
      },
      orderBy: [{ vehicleTypeId: 'asc' }, { durationDays: 'asc' }],
    });
  }

  async create(data: CreatePackageInput) {
    const pkg = await prisma.parkingPackage.create({
      data: {
        name: data.name,
        vehicleTypeId: data.vehicleTypeId,
        durationDays: data.durationDays,
        price: data.price,
        description: data.description ?? null,
      },
    });

    return { message: 'Thêm gói dịch vụ thành công', id: pkg.id };
  }

  async update(id: number, data: UpdatePackageInput) {
    await prisma.parkingPackage.update({
      where: { id },
      data: {
        name: data.name,
        vehicleTypeId: data.vehicleTypeId,
        durationDays: data.durationDays,
        price: data.price,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    // Gỡ liên kết customer packages và payments trước
    const customerPkgs = await prisma.customerPackage.findMany({
      where: { packageId: id },
      select: { id: true },
    });

    if (customerPkgs.length > 0) {
      const cpIds = customerPkgs.map(cp => cp.id);
      await prisma.payment.deleteMany({
        where: { customerPackageId: { in: cpIds } },
      });
      await prisma.customerPackage.deleteMany({
        where: { packageId: id },
      });
    }

    await prisma.parkingPackage.delete({
      where: { id },
    });

    return { message: 'Xóa gói dịch vụ thành công' };
  }
}

export const packageService = new PackageService();
