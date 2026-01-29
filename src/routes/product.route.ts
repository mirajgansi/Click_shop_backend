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
  "/createProduct",
  authorizedMiddleware,
  adminMiddleware,
  productController.createProduct,
);
router.put("/:id", productController.updateProduct);
router.get("/:id", productController.getProductById);
router.delete("/:id", adminMiddleware, productController.deleteProduct);

router.put(
  "/update-image",
  authorizedMiddleware,
  adminMiddleware, //should be logined
  uploads.single("image"),
  productController.updateProduct,
);

router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/recent", productController.getRecentlyAdded);
router.get("/trending", productController.getTrending);
router.get("/popular", productController.getMostPopular);
router.get("/top-rated", productController.getTopRated);
router.get("/:id", productController.getProductById);
export default router;
