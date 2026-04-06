import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên gói'),
  vehicleTypeId: z.number().int().positive('VehicleTypeId không hợp lệ'),
  durationDays: z.number().int().positive('Số ngày phải lớn hơn 0'),
  price: z.number().positive('Giá phải lớn hơn 0'),
  description: z.string().optional().nullable(),
});

export const updatePackageSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên gói'),
  vehicleTypeId: z.number().int().positive('VehicleTypeId không hợp lệ'),
  durationDays: z.number().int().positive('Số ngày phải lớn hơn 0'),
  price: z.number().positive('Giá phải lớn hơn 0'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
