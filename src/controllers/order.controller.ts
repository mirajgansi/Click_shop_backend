import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { UpdateOrderStatusDto } from "../dtos/order.dto";
import { HttpError } from "../errors/http-error";

export class OrderController {
  private service: OrderService;

  constructor() {
    this.service = new OrderService();
  }

  // POST /api/orders  (checkout -> create from cart)
  async createFromCart(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const order = await this.service.createFromCart(userId, req.body);
    return res
      .status(201)
      .json({ success: true, message: "Order created", data: order });
  }

  // GET /api/orders/me
  async getMyOrders(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const orders = await this.service.getMyOrders(userId);
    return res.json({ success: true, data: orders });
  }

  // GET /api/orders/:id
  async getOrderById(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const role = (req as any).user?.role;

    const order = await this.service.getOrderById(req.params.id);

    // user can only see own order (admin can see all)
    if (role !== "admin" && String(order.userId) !== String(userId)) {
      throw new HttpError(403, "Forbidden");
    }

    return res.json({ success: true, data: order });
  }

  // ADMIN: GET /api/orders
  async getAllOrders(req: Request, res: Response) {
    const orders = await this.service.getAllOrders();
    return res.json({ success: true, data: orders });
  }

  // ADMIN: PATCH /api/orders/:id/status
  async updateStatus(req: Request, res: Response) {
    const parsed = UpdateOrderStatusDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const updated = await this.service.updateStatus(req.params.id, parsed.data);
    return res.json({ success: true, message: "Order updated", data: updated });
  }
}
