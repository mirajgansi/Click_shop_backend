import mongoose, { HydratedDocument, Schema } from "mongoose";
import { ProductType } from "../types/product.type";

export type ProductDoc = HydratedDocument<ProductType>;

const ProductSchema = new Schema<ProductType>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    manufacturer: { type: String, required: true },
    manufactureDate: { type: String, required: true },
    expireDate: { type: String, required: true },
    nutritionalInfo: { type: String, required: true },

    inStock: { type: Number, default: 0, min: 0 },

    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    sku: { type: String, unique: true, sparse: true },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const ProductModel =
  mongoose.models.Product ||
  mongoose.model<ProductType>("Product", ProductSchema);
