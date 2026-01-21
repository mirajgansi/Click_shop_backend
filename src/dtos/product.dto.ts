import { z } from "zod";
import { ProductSchema } from "../types/product.type";

export const CreateProductDto = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  description: z.string().optional(),
  manufacturer: z.string().min(1),
  manufactureDate: z.string().min(1),
  expireDate: z.string().min(1),
  nutritionalInfo: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().min(1),
});

// export const updateProductDto = z.object({
//   name: z.string().min(2).optional(),
//   price: z.number().nonnegative().optional(),
//   description: z.string().optional(),
//   manufacturer: z.string().min(1).optional(),
//   manufactureDate: z.string().min(1).optional(),
//   expireDate: z.string().min(1).optional(),
//   nutritionalInfo: z.string().min(1).optional(),
//   category: z.string().min(1).optional(),
//   imageUrl: z.string().min(1).optional(),
//   reviewCount: z.number().min(0).optional(),
//   averageRating: z.number().min(0).max(5).optional(),
// });
export const UpdateProductDto = ProductSchema.partial();

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
