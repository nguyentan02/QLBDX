import { z } from 'zod';

const licensePlateRegex = /^\d{2}[A-Z]\d{4,5}$/;

export const createVehicleSchema = z.object({
  customerId: z.number().int().positive('CustomerId không hợp lệ'),
  vehicleTypeId: z.number().int().positive('VehicleTypeId không hợp lệ'),
  licensePlate: z.string().min(1, 'Vui lòng nhập biển số xe').regex(licensePlateRegex, 'Biển số không đúng định dạng (VD: 29A87642)'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const updateVehicleSchema = createVehicleSchema;

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
