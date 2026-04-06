import prisma from '../config/prisma';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.validator';

export class CustomerService {
  async findAll(search?: string) {
    return prisma.customer.findMany({
      where: {
        isActive: true,
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
}

export const customerService = new CustomerService();
