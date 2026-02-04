import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";
let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// add remaning routes like login, logout, etc.
router.get("/whoamI", authorizedMiddleware, authController.getUserbyId);

router.put(
  "/update-profile",
  authorizedMiddleware, //should be logined
  uploads.single("image"),
  authController.updateUser,
);
router.delete("/me", authorizedMiddleware, authController.deleteMyAccount);

router.post("/send-reset-password-email", authController.requestPasswordChange);

export default router;
