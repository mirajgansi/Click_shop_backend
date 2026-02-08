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
  }: {
    page?: string;
    size?: string;
    search?: string;
  }) {
    const currentPage = page ? parseInt(page) : 1;
    const pageSize =
      size === "all" ? Number.MAX_SAFE_INTEGER : size ? parseInt(size) : 10;
    const currentSearch = search || "";
    const { products, total } = await productRepository.getAllProducts({
      page: currentPage,
      size: pageSize,
      search: currentSearch,
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
    return await productRepository.getRecentlyAdded(limit);
  }

  // trending = highest selling
  async getTrendingProducts(limit = 10) {
    return await productRepository.getTrending(limit);
  }

  // popular = most viewed
  async getMostPopularProducts(limit = 10) {
    return await productRepository.getMostPopular(limit);
  }

  // top rated
  async getTopRatedProducts(limit = 10) {
    return await productRepository.getTopRated(limit);
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
