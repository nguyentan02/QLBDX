import { z } from 'zod';

export const createCustomerSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  address: z.string().optional().nullable(),
  identityCard: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
