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
  inStock: true,
  sku: true,
}).extend({
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.coerce.number().positive(),
  inStock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
});

export const UpdateProductDto = ProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
