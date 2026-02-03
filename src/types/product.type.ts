import z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  price: z.coerce.number().positive("Price must be greater than 0"),
  available: z.coerce.boolean().default(true),
  inStock: z.coerce.number().int("Stock must be an integer").min(0).default(0),
  manufacturer: z.string().min(1, "Manufacturer is required"),

  manufactureDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid manufacture date",
  }),

  expireDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid expire date",
  }),

  nutritionalInfo: z.string().min(1, "Nutritional info is required"),

  category: z.string().min(1, "Category is required"),

  image: z.string().optional(),
  // available: z.boolean().default(true),

  // inStock: z
  //   .number()
  //   .int("Stock must be an integer")
  //   .min(0, "Stock cannot be negative")
  //   .default(0),
  sku: z.string().optional,

  totalSold: z.number().int().min(0).default(0),

  totalRevenue: z.number().min(0).default(0),

  viewCount: z.number().int().min(0).default(0),

  averageRating: z
    .number()
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be more than 5")
    .default(0),
  reviewCount: z.number().int().min(0).default(0),
});

export type ProductType = z.infer<typeof ProductSchema>;
