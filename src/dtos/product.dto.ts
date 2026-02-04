import { z } from "zod";
import { ProductSchema } from "../types/product.type";
export const CreateProductDto = ProductSchema.pick({
  name: true,
  description: true,
  price: true,
  manufacturer: true,
  manufactureDate: true,
  expireDate: true,
  nutritionalInfo: true,
  category: true,
  available: true,
  inStock: true,
  sku: true,
  image: true,
}).extend({
  price: z.coerce.number().positive(),
  available: z.coerce.boolean().default(true),
  inStock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
});

export const UpdateProductDto = ProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
