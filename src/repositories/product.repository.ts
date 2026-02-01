import { ProductModel, ProductDoc } from "../models/product.model";
import type { ProductType } from "../types/product.type";

export interface IProductRepository {
  getProductById(id: string): Promise<ProductDoc | null>;
  getAllProducts(args: {
    page: number;
    size: number;
    search?: string;
  }): Promise<{ products: ProductDoc[]; total: number }>;

  createProduct(productData: Partial<ProductType>): Promise<ProductDoc>;
  updateProduct(
    id: string,
    updateData: Partial<ProductType>,
  ): Promise<ProductDoc | null>;
  deleteProduct(id: string): Promise<boolean>;

  getProductByName(name: string): Promise<ProductDoc | null>;
  getProductsByCategory(category: string): Promise<ProductDoc[]>;
  getRecentlyAdded(limit?: number): Promise<ProductDoc[]>;
  getTrending(limit?: number): Promise<ProductDoc[]>;
  getMostPopular(limit?: number): Promise<ProductDoc[]>;
  getTopRated(limit?: number): Promise<ProductDoc[]>;
}

export class ProductRepository implements IProductRepository {
  async createProduct(productData: Partial<ProductType>): Promise<ProductDoc> {
    return await ProductModel.create(productData);
  }

  async getProductByName(name: string): Promise<ProductDoc | null> {
    return await ProductModel.findOne({ name });
  }

  async getProductById(id: string): Promise<ProductDoc | null> {
    return await ProductModel.findById(id);
  }

  async updateProduct(
    id: string,
    updateData: Partial<ProductType>,
  ): Promise<ProductDoc | null> {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllProducts({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search?: string;
  }) {
    const filter: any = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { manufacturer: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .skip((page - 1) * size)
        .limit(size)
        .sort({ createdAt: -1 }),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  async getProductsByCategory(category: string) {
    return await ProductModel.find({ category, available: true }).sort({
      createdAt: -1,
    });
  }

  async getRecentlyAdded(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getTrending(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ totalSold: -1 })
      .limit(limit);
  }

  async getMostPopular(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  async getTopRated(limit = 10) {
    return await ProductModel.find({ available: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
  }
}

// async createProduct(productData: Partial<Product[]>) {
//   return await ProductModel.create(productData);
// }

// async getProductById(id: string) {
//   return await ProductModel.findById(id);
// }

// async getAllProducts() {
//   return await ProductModel.find().sort({ createdAt: -1 });
// }

// async updateProduct(id: string, updateData: Partial<Product[]>) {
//   return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
// }

// async deleteProduct(id: string) {
//   const result = await ProductModel.findByIdAndDelete(id);
//   return !!result;
// }

// async getProductByName(name: string) {
//   return await ProductModel.findOne({ name });
// }

// async getProductsByCategory(category: string) {
//   return await ProductModel.find({ category, available: true }).sort({
//     createdAt: -1,
//   });
// }

// //  recently added products
// async getRecentlyAdded(limit = 10) {
//   return await ProductModel.find({ available: true })
//     .sort({ createdAt: -1 })
//     .limit(limit);
// }

// //  trending = highest selling
// async getTrending(limit = 10) {
//   return await ProductModel.find({ available: true })
//     .sort({ totalSold: -1 })
//     .limit(limit);
// }

// // popular = most viewed (simple)
// async getMostPopular(limit = 10) {
//   return await ProductModel.find({ available: true })
//     .sort({ viewCount: -1 })
//     .limit(limit);
// }

// // top rated = average rating + count (more fair)
// async getTopRated(limit = 10) {
//   return await ProductModel.find({ available: true })
//     .sort({ averageRating: -1, reviewCount: -1 })
//     .limit(limit);
// }
