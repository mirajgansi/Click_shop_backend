import { Request, Response } from "express";
import z from "zod";
import { ProductService } from "../services/product.service";
import {
  CreateProductDto,
  RestockProductDto,
  UpdateProductDto,
} from "../dtos/product.dto";
import mongoose from "mongoose";

const productService = new ProductService();
interface QueryParams {
  page?: string;
  size?: string;
  search?: string;
}

interface QueryParams {
  page?: string;
  size?: string;
  search?: string;
  category?: string;
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

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product id",
        });
      }

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
      const products = await productService.getTrending(limit);

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
      const products = await productService.getMostPopular(limit);

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
      const products = await productService.getTopRated(limit);

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

      // 1) clone body (multer gives strings)
      const body: any = { ...req.body };

      // 2) parse existingImages (JSON string -> array)
      if (typeof body.existingImages === "string") {
        try {
          body.existingImages = JSON.parse(body.existingImages);
        } catch {
          return res.status(400).json({
            success: false,
            message: "existingImages must be valid JSON",
          });
        }
      }

      // 3) parse with zod
      const parsedData = UpdateProductDto.safeParse(body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      // 4) handle multiple uploaded images (req.files)
      // depends on multer config: upload.array("image", 5)
      const files = (req as any).files as Express.Multer.File[] | undefined;

      if (files?.length) {
        const newImages = files.map((f) => `/uploads/${f.filename}`);

        // if your DB uses `images` array:
        parsedData.data.existingImages = [
          ...(Array.isArray(parsedData.data.existingImages)
            ? parsedData.data.existingImages
            : []),
          ...newImages,
        ];

        // optional: also set `image` as first image
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

  async restockProduct(req: Request, res: Response) {
    try {
      const adminId = req.user?._id;
      if (!adminId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const productId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product id" });
      }

      const parsed = RestockProductDto.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsed.error),
        });
      }

      const updated = await productService.restockProduct(
        productId,
        parsed.data,
      );

      return res.status(200).json({
        success: true,
        message: "Product restocked successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- OUT OF STOCK (ADMIN/ANY) ----------------
  async getOutOfStockProducts(req: Request, res: Response) {
    try {
      const { page, size, search, category }: QueryParams = req.query;

      const result = await productService.getOutOfStockProducts({
        page,
        size,
        search,
        category,
      });

      return res.status(200).json({
        success: true,
        message: "Out of stock products fetched successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // ---------------- VIEW COUNT (PUBLIC) ----------------
  // call this when product detail page opens
  async incrementViewCount(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product id",
        });
      }

      const updated = await productService.incrementViewCount(productId);

      return res.status(200).json({
        success: true,
        message: "View count incremented",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
