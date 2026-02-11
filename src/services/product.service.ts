import { HttpError } from "../errors/http-error";
import { ProductRepository } from "../repositories/product.repository";
// import { UserRepository } from "../repositories/user.repository"; // only if you want to validate admin exists
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ProductModel } from "../models/product.model";

const productRepository = new ProductRepository();
// const userRepository = new UserRepository(); // optional

export class ProductService {
  // ---------------- CREATE (ADMIN) ----------------
  async createProduct(data: CreateProductDto, adminId: string) {
    const nameCheck = await productRepository.getProductByName(data.name);
    if (nameCheck) throw new HttpError(409, "Product name already in use");

    const newProduct = await productRepository.createProduct({
      ...data,
    });

    return newProduct;
  }

  // ---------------- READ ----------------
  async getProductById(productId: string) {
    const product = await productRepository.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  }

  async getAllProducts({
    page,
    size,
    search,
    category,
  }: {
    page?: string;
    size?: string;
    search?: string;
    category?: string;
  }) {
    const currentPage = page ? parseInt(page) : 1;
    const pageSize =
      size === "all" ? Number.MAX_SAFE_INTEGER : size ? parseInt(size) : 10;

    const currentSearch = (search ?? "").trim();

    const currentCategory = (category ?? "").trim();
    const normalizedCategory =
      !currentCategory || currentCategory === "All" ? "" : currentCategory;

    const { products, total } = await productRepository.getAllProducts({
      page: currentPage,
      size: pageSize,
      search: currentSearch,
      category: normalizedCategory,
    });

    const pagination = {
      page: currentPage,
      size: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { products, pagination };
  }

  async getProductsByCategory(category: string) {
    const clean = category?.trim();
    if (!clean) {
      throw new HttpError(400, "Category is required");
    }

    return productRepository.getProductsByCategory(clean);
  }
  // recently added
  async getRecentlyAdded(limit = 10) {
    return await ProductModel.find({ inStock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // trending = highest selling
  async getTrending(limit = 10) {
    return await ProductModel.find({ inStock: { $gt: 0 } })
      .sort({ totalSold: -1 })
      .limit(limit);
  }
  // popular = most viewed
  async getMostPopular(limit = 10) {
    return await ProductModel.find({ inStock: { $gt: 0 } })
      .sort({ viewCount: -1 })
      .limit(limit);
  }
  // top rated
  async getTopRated(limit = 10) {
    return await ProductModel.find({ inStock: { $gt: 0 } })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
  }

  // ---------------- UPDATE (ADMIN) ----------------
  async updateProduct(productId: string, data: UpdateProductDto) {
    const existing = await productRepository.getProductById(productId);
    if (!existing) throw new HttpError(404, "Product not found");

    // if updating name, check duplicates
    if (data.name && data.name !== existing.name) {
      const nameCheck = await productRepository.getProductByName(data.name);
      if (nameCheck) throw new HttpError(409, "Product name already in use");
    }

    const updated = await productRepository.updateProduct(productId, data);
    return updated;
  }

  // ---------------- DELETE (ADMIN) ----------------
  async deleteProduct(productId: string) {
    const ok = await productRepository.deleteProduct(productId);
    if (!ok) throw new HttpError(404, "Product not found");
    return { success: true };
  }

  // ---------------- OPTIONAL: analytics helpers ----------------
  //   async incrementViewCount(productId: string) {
  //     // Better if repository supports $inc.
  //     const product = await productRepository.getProductById(productId);
  //     if (!product) throw new HttpError(404, "Product not found");

  //     const updated = await productRepository.updateProduct(productId, {
  //       viewCount: (product.viewCount ?? 0) + 1,
  //     } as any);

  //     return updated;
  //   }
}
