import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";
import { ProductController } from "../controllers/product.controller";
let productController = new ProductController();
const router = Router();

router.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  uploads.array("image", 3),
  productController.createProduct,
);
router.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);
router.put(
  "/update-image",
  authorizedMiddleware,
  adminMiddleware, //should be logined
  uploads.array("image", 3),
  productController.updateProduct,
);

router.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  productController.updateProduct,
);
router.get("/:id", productController.getProductById);
router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/recent", productController.getRecentlyAdded);
router.get("/trending", productController.getTrending);
router.get("/popular", productController.getMostPopular);
router.get("/top-rated", productController.getTopRated);
router.get("/:id", productController.getProductById);
export default router;
