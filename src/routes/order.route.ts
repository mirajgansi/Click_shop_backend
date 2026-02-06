import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
  driverMiddleware,
} from "../middleware/authorized.middleware";

const router = Router();
const controller = new OrderController();

router.use(authorizedMiddleware);

router.post("/", controller.createFromCart.bind(controller));
router.get("/me", controller.getMyOrders.bind(controller));
router.get("/:id", controller.getOrderById.bind(controller));

// admin
router.get("/", adminMiddleware, controller.getAllOrders.bind(controller));
router.patch(
  "/:id/status",
  adminMiddleware,
  controller.updateStatus.bind(controller),
);
router.patch("/orders/:id/cancel", controller.cancelMyOrder);

// admin assign driver
router.patch(
  "/:id/assign-driver",
  adminMiddleware,
  controller.assignDriver.bind(controller),
);

// // driver get assigned orders
router.get(
  "/driver/my-orders",
  authorizedMiddleware,
  driverMiddleware, // or role check
  controller.getMyAssignedOrders.bind(controller),
);

export default router;
