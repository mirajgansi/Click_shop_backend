import mongoose, { Document, InferSchemaType, Schema } from "mongoose";
import { ProductType } from "../types/product.type";

const productSchema = new Schema<ProductType>(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0, index: true },

    category: { type: String, required: true, index: true },

    imageUrl: { type: String },

    manufacturer: { type: String, required: true },

    manufactureDate: { type: String, required: true },
    expireDate: { type: String, required: true },

    nutritionalInfo: { type: String, required: true },

    available: { type: Boolean, default: true },

    inStock: { type: Number, default: 0, min: 0 },

    //  Admin dashboard stats (cached)
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    //  Audit
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Admin",
    //   required: true,
    // },

    // Optional
    sku: { type: String, unique: true, sparse: true },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel = mongoose.model<Product>("Product", productSchema);
