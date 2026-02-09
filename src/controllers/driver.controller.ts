import { Request, Response } from "express";
import { DriverService } from "../services/driver.service";

const driverService = new DriverService();

export class DriverController {
  // PATCH /driver/:id/status  (driverMiddleware)
  async driverUpdateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body as { status: "active" | "inactive" };

    const result = await driverService.driverUpdateStatus(id, status);
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  }
  async driverUpdateOrderStatus(req: Request, res: Response) {
    const { id: orderId } = req.params;
    const { status } = req.body as { status: "shipped" | "delivered" };

    const result = await driverService.driverUpdateOrderStatus(orderId, status);
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  }

  async getDriversByStats(req: Request, res: Response) {
    const { search } = req.query as { search?: string };
    const result = await driverService.getDriversWithStats({ search });
    return res.json(result);
  }

  async getDriverStatsById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await driverService.getDriverStatsById(id);
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  }
}
