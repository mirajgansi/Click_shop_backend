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
      const adminId = req.user?._id;
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateProductDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Image is required" });
      }

      parsedData.data.image = `/uploads/${files[0].filename}`;
      parsedData.data.images = files.map((f) => `/uploads/${f.filename}`);

      // optional gallery:
      // parsedData.data.images = files.map((f) => `/uploads/${f.filename}`);

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
      const products = await productService.getProductsByCategory(
        req.params.category,
      );

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
        parsedData.data.image = `/uploads/${req.file.filename}`;
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
