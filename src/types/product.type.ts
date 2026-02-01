import z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.number().positive(),
  manufacturer: z.string().min(1),
  manufactureDate: z.string().min(1),
  expireDate: z.string().min(1),
  nutritionalInfo: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().min(1),
  available: z.boolean().default(true),
  inStock: z.number().min(0).default(0),

  //admin
  sku: z.string().optional(),
  totalSold: z.number().min(0).default(0),
  totalRevenue: z.number().min(0).default(0), // optional but useful
  viewCount: z.number().min(0).default(0),

  //ratings
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
});

export type ProductType = z.infer<typeof ProductSchema>;
