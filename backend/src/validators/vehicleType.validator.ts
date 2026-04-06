import { z } from 'zod';

export const createVehicleTypeSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên loại xe'),
  description: z.string().optional().nullable(),
  hourlyRate: z.number().positive('Giá theo giờ phải lớn hơn 0'),
  dailyRate: z.number().positive('Giá theo ngày phải lớn hơn 0'),
  monthlyRate: z.number().positive('Giá theo tháng phải lớn hơn 0'),
});

export const updateVehicleTypeSchema = createVehicleTypeSchema;

export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeSchema>;
export type UpdateVehicleTypeInput = z.infer<typeof updateVehicleTypeSchema>;
