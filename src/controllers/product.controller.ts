import { Request, Response } from "express";
import z from "zod";
import { ProductService } from "../services/product.service";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

const productService = new ProductService();
interface QueryParams {
  page?: string;
  size?: string;
  search?: string;
}
export class ProductController {
  // ---------------- CREATE (ADMIN ONLY) ----------------
  async createProduct(req: Request, res: Response) {
    try {
      const adminId = req.user?._id; // from auth middleware
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateProductDto.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      // optional: if product image uploaded by multer
      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const product = await productService.createProduct(
        parsedData.data,
        adminId,
      );

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- READ ----------------
  async getProductById(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      const product = await productService.getProductById(productId);

      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;
      const products = await productService.getAllProducts({
        page,
        size,
        search,
      });
      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response) {
    try {
      const category = req.params.category;
      const products = await productService.getProductsByCategory(category);

      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // recently added
  async getRecentlyAdded(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 10);
      const products = await productService.getRecentlyAdded(limit);

      return res.status(200).json({
        success: true,
        message: "Recently added products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // trending = highest selling
  async getTrending(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 10);
      const products = await productService.getTrendingProducts(limit);

      return res.status(200).json({
        success: true,
        message: "Trending products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // most popular = most viewed
  async getMostPopular(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 10);
      const products = await productService.getMostPopularProducts(limit);

      return res.status(200).json({
        success: true,
        message: "Popular products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // top rated
  async getTopRated(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit ?? 10);
      const products = await productService.getTopRatedProducts(limit);

      return res.status(200).json({
        success: true,
        message: "Top rated products fetched successfully",
        data: products,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- UPDATE (ADMIN ONLY) ----------------
  async updateProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      const parsedData = UpdateProductDto.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updated = await productService.updateProduct(
        productId,
        parsedData.data,
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- DELETE (ADMIN ONLY) ----------------
  async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      const result = await productService.deleteProduct(productId);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
