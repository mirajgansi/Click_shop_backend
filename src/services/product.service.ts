import { HttpError } from "../errors/http-error";
import { ProductRepository } from "../repositories/product.repository";
// import { UserRepository } from "../repositories/user.repository"; // only if you want to validate admin exists
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { ProductModel } from "../models/product.model";
import { UserModel } from "../models/user.model";
import { NotificationService } from "./notification.service";

const productRepository = new ProductRepository();
// const userRepository = new UserRepository(); // optional
const notificationService = new NotificationService();

export class ProductService {
  // ---------------- CREATE (ADMIN) ----------------
  async createProduct(data: CreateProductDto, adminId: string) {
    const nameCheck = await productRepository.getProductByName(data.name);
    if (nameCheck) throw new HttpError(409, "Product name already in use");

    const newProduct = await productRepository.createProduct({ ...data });

    const users = await UserModel.find({ role: "user" }).select("_id");

    await Promise.all(
      users.map((u) =>
        notificationService.notify({
          to: u._id.toString(),
          from: adminId,
          type: "product_added",
          title: "New Product Added",
          message: `${newProduct.name} is now available!`,
          data: {
            productId: newProduct._id.toString(),
            url: `/products/${newProduct._id}`,
          },
        }),
      ),
    );

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
  async getRecentlyAdded(page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const filter = { inStock: { $gt: 0 } };

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  // trending = highest selling
  async getTrending(page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const filter = { inStock: { $gt: 0 } };

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort({ totalSold: -1 }).skip(skip).limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  // popular = most viewed
  async getMostPopular(page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const filter = { inStock: { $gt: 0 } };

    const [products, total] = await Promise.all([
      ProductModel.find(filter).sort({ viewCount: -1 }).skip(skip).limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  // top rated
  async getTopRated(page: number = 1, size: number = 10) {
    const skip = (page - 1) * size;
    const filter = { inStock: { $gt: 0 } };

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ averageRating: -1, reviewCount: -1 })
        .skip(skip)
        .limit(size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  }

  // ---------------- UPDATE (ADMIN) ----------------
  // ---------------- UPDATE (ADMIN) ----------------
  async updateProduct(productId: string, data: UpdateProductDto) {
    const existing = await productRepository.getProductById(productId);
    if (!existing) throw new HttpError(404, "Product not found");

    // if updating name, check duplicates
    if (data.name && data.name !== existing.name) {
      const nameCheck = await productRepository.getProductByName(data.name);
      if (nameCheck) throw new HttpError(409, "Product name already in use");
    }

    const update: any = { ...data };

    if (Array.isArray(data.existingImages)) {
      update.images = data.existingImages;
      update.image = data.existingImages[0] ?? existing.image;
      delete update.existingImages;
    }

    const updated = await productRepository.updateProduct(productId, update);
    return updated;
  }

  // ---------------- DELETE (ADMIN) ----------------
  async deleteProduct(productId: string) {
    const ok = await productRepository.deleteProduct(productId);
    if (!ok) throw new HttpError(404, "Product not found");
    return { success: true };
  }

  // ---------------- OPTIONAL: analytics helpers ----------------
  async incrementViewCount(productId: string) {
    // Better if repository supports $inc.
    const product = await productRepository.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const updated = await productRepository.updateProduct(productId, {
      viewCount: (product.viewCount ?? 0) + 1,
    } as any);

    return updated;
  }

  async restockProduct(
    productId: string,
    input: { quantity: number; mode?: "set" | "add" },
  ) {
    const quantity = Number(input.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new HttpError(400, "Quantity must be a valid number (>= 0)");
    }

    const product = await productRepository.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const mode = input.mode ?? "set";
    const nextStock =
      mode === "add" ? (product.inStock ?? 0) + quantity : quantity;

    const updated = await productRepository.updateProduct(productId, {
      inStock: nextStock,
    } as UpdateProductDto);

    return updated;
  }

  // ---------------- OUT OF STOCK ----------------
  async getOutOfStockProducts({
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

    const filter: any = { inStock: { $lte: 0 } };

    if (currentSearch) {
      filter.$or = [
        { name: { $regex: currentSearch, $options: "i" } },
        // add more fields if you want:
        // { brand: { $regex: currentSearch, $options: "i" } },
      ];
    }

    if (normalizedCategory) filter.category = normalizedCategory;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      ProductModel.countDocuments(filter),
    ]);

    const pagination = {
      page: currentPage,
      size: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { products, pagination };
  }
}
