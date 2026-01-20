import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// add remaning routes like login, logout, etc.
router.get("/whoamI", authorizedMiddleware, authController.getUserbyId);
export default router;
