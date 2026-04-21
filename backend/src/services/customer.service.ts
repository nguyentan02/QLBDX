import prisma from '../config/prisma';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.validator';

export class CustomerService {
  async findAll(search?: string, includeInactive?: boolean) {
    return prisma.customer.findMany({
      where: {
        ...(!includeInactive && { isActive: true }),
        ...(search && {
          OR: [
            { fullName: { contains: search } },
            { phone: { contains: search } },
            { identityCard: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw { status: 404, message: 'Không tìm thấy khách hàng' };
    }

    return customer;
  }

  async create(data: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,
        address: data.address ?? null,
        identityCard: data.identityCard ?? null,
      },
    });

    return { message: 'Thêm khách hàng thành công', id: customer.id };
  }

  async update(id: number, data: UpdateCustomerInput) {
    await prisma.customer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? null,
        address: data.address ?? null,
        identityCard: data.identityCard ?? null,
      },
    });

    return { message: 'Cập nhật thành công' };
  }

  async softDelete(id: number) {
    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Xóa khách hàng thành công' };
  }

  async toggleActive(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw { status: 404, message: 'Không tìm thấy khách hàng' };
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { isActive: !customer.isActive },
    });

    return {
      message: updated.isActive ? 'Kích hoạt khách hàng thành công' : 'Vô hiệu hóa khách hàng thành công',
      isActive: updated.isActive,
    };
  }
}

export const customerService = new CustomerService();
