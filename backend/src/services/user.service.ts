import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { CreateUserInput, UpdateUserInput } from '../validators/user.validator';

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { status: 404, message: 'Không tìm thấy người dùng' };
    }

    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      throw { status: 400, message: 'Tên đăng nhập đã tồn tại' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash: hashedPassword,
        fullName: data.fullName,
        email: data.email ?? null,
        phone: data.phone ?? null,
        role: data.role ?? 'staff',
      },
    });

    return { message: 'Tạo người dùng thành công', id: user.id };
  }

  async update(id: number, data: UpdateUserInput) {
    const updateData: any = {
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      role: data.role ?? 'staff',
      isActive: data.isActive ?? true,
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { message: 'Cập nhật thành công' };
  }

  async delete(id: number) {
    await prisma.user.delete({
      where: { id },
    });

    return { message: 'Xóa người dùng thành công' };
  }
}

export const userService = new UserService();
