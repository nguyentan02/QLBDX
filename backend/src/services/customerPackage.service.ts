import prisma from '../config/prisma';
import { CreateCustomerPackageInput } from '../validators/customerPackage.validator';

export class CustomerPackageService {
  async findAll(customerId?: number, status?: string) {
    return prisma.customerPackage.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(status && { status }),
      },
      include: {
        customer: { select: { fullName: true, phone: true } },
        parkingPackage: { select: { name: true, price: true } },
        vehicle: { select: { licensePlate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateCustomerPackageInput, createdByUserId: number) {
    const pkg = await prisma.parkingPackage.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      throw { status: 404, message: 'Không tìm thấy gói dịch vụ' };
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pkg.durationDays);

    const customerPackage = await prisma.customerPackage.create({
      data: {
        customerId: data.customerId,
        packageId: data.packageId,
        vehicleId: data.vehicleId,
        startDate,
        endDate,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        customerPackageId: customerPackage.id,
        amount: pkg.price,
        paymentType: 'package',
        createdBy: createdByUserId,
      },
    });

    return { message: 'Đăng ký gói thành công', id: customerPackage.id };
  }

  async update(id: number, data: { customerId?: number; vehicleId?: number; status?: string }) {
    const updateData: any = {};
    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;
    if (data.status !== undefined) updateData.status = data.status;

    await prisma.customerPackage.update({
      where: { id },
      data: updateData,
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    // Xóa payment liên kết trước
    await prisma.payment.deleteMany({
      where: { customerPackageId: id },
    });

    await prisma.customerPackage.delete({
      where: { id },
    });

    return { message: 'Xóa gói dịch vụ thành công' };
  }

  async checkActivePackage(vehicleId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activePackage = await prisma.customerPackage.findFirst({
      where: {
        vehicleId,
        status: 'active',
        endDate: { gte: today },
      },
      include: {
        parkingPackage: { select: { name: true } },
      },
    });

    return {
      hasPackage: !!activePackage,
      package: activePackage ?? null,
    };
  }
}

export const customerPackageService = new CustomerPackageService();
