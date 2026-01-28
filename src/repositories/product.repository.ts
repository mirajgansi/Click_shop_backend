import { ProductModel, type Product } from "../models/product.model";
import type { HydratedDocument } from "mongoose";

export interface IProductRepository {
  getProductById(id: string): Promise<HydratedDocument<Product> | null>;
  getAllProducts(): Promise<HydratedDocument<Product>[]>;
  createProduct(
    productData: Partial<Product>,
  ): Promise<HydratedDocument<Product>>;
  updateProduct(
    id: string,
    updateData: Partial<Product>,
  ): Promise<HydratedDocument<Product> | null>;
  deleteProduct(id: string): Promise<boolean>;
  getProductByName(name: string): Promise<HydratedDocument<Product> | null>;

  getProductsByCategory(category: string): Promise<HydratedDocument<Product>[]>;
  getRecentlyAdded(limit?: number): Promise<HydratedDocument<Product>[]>;
  getTrending(limit?: number): Promise<HydratedDocument<Product>[]>; // highest selling
  getMostPopular(limit?: number): Promise<HydratedDocument<Product>[]>; // most viewed (or weighted)
  getTopRated(limit?: number): Promise<HydratedDocument<Product>[]>;
}

export class ProductRepository implements IProductRepository {
  async createProduct(productData: Partial<Product>) {
    return await ProductModel.create(productData);
  }

  async getProductById(id: string) {
    return await ProductModel.findById(id);
  }

  async getAllProducts() {
    return await ProductModel.find().sort({ createdAt: -1 });
  }

  async updateProduct(id: string, updateData: Partial<Product>) {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProduct(id: string) {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  async getProductByName(name: string) {
    return await ProductModel.findOne({ name });
  }

  async getProductsByCategory(category: string) {
    return await ProductModel.find({ category, available: true }).sort({
      createdAt: -1,
    });
  }

  //  recently added products
  async getRecentlyAdded(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  //  trending = highest selling
  async getTrending(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ totalSold: -1 })
      .limit(limit);
  }

  // popular = most viewed (simple)
  async getMostPopular(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  // top rated = average rating + count (more fair)
  async getTopRated(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
  }
}
