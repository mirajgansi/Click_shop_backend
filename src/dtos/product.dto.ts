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
  existingImages: z.union([z.string(), z.array(z.string())]).optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.coerce.number().positive(),
  inStock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional(),
});

export const UpdateProductDto = ProductSchema.pick({
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
})
  .partial()
  .extend({
    // ✅ add this
    existingImages: z.array(z.string()).optional(),

    // ✅ ensure multipart/form-data works
    price: z.coerce.number().positive().optional(),
    inStock: z.coerce.number().int().min(0).optional(),

    // ✅ allow empty string clears (optional but helpful)
    manufacturer: z.string().optional().or(z.literal("")),
    manufactureDate: z.string().optional().or(z.literal("")),
    expireDate: z.string().optional().or(z.literal("")),
    nutritionalInfo: z.string().optional().or(z.literal("")),
    sku: z.string().optional().or(z.literal("")),
  });

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
