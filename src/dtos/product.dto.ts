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

// export const updateProductDto = z.object({
//   name: z.string().min(2).optional(),
//   price: z.number().nonnegative().optional(),
//   description: z.string().optional(),
//   manufacturer: true.optional(),
//   manufactureDate: true.optional(),
//   expireDate: true.optional(),
//   nutritionalInfo: true.optional(),
//   category: true.optional(),
//   imageUrl: true.optional(),
//   reviewCount: z.number().min(0).optional(),
//   averageRating: z.number().min(0).max(5).optional(),
// });
export const UpdateProductDto = ProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
