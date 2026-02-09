import mongoose from "mongoose";
import { DriverRepository } from "../repositories/driver.repository";

export class DriverService {
  constructor(private repo = new DriverRepository()) {}

  async driverUpdateStatus(driverId: string, status: "active" | "inactive") {
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return { success: false, message: "Invalid driver id" };
    }

    const driver = await this.repo.findDriverById(driverId);
    if (!driver) return { success: false, message: "Driver not found" };
    if (driver.role !== "driver")
      return { success: false, message: "User is not a driver" };

    const updated = await this.repo.updateDriverStatus(driverId, status);
    return { success: true, message: "Driver status updated", data: updated };
  }

  //   async assignDriver(orderId: string, driverId: string) {
  //     if (!mongoose.Types.ObjectId.isValid(orderId))
  //       return { success: false, message: "Invalid order id" };
  //     if (!mongoose.Types.ObjectId.isValid(driverId))
  //       return { success: false, message: "Invalid driver id" };

  //     const order = await this.repo.findOrderById(orderId);
  //     if (!order) return { success: false, message: "Order not found" };

  //     if (order.status === "cancelled" || order.status === "delivered") {
  //       return {
  //         success: false,
  //         message: `Cannot assign driver when order is ${order.status}`,
  //       };
  //     }

  //     const driver = await this.repo.findDriverById(driverId);
  //     if (!driver) return { success: false, message: "Driver not found" };
  //     if (driver.role !== "driver")
  //       return { success: false, message: "Selected user is not a driver" };

  //     if (driver.status !== "active") {
  //       return { success: false, message: "Driver is not active" };
  //     }

  //     const updated = await this.repo.assignDriverToOrder(orderId, driverId);
  //     return { success: true, message: "Driver assigned", data: updated };
  //   }

  async driverUpdateOrderStatus(
    orderId: string,
    status: "shipped" | "delivered",
  ) {
    if (!mongoose.Types.ObjectId.isValid(orderId))
      return { success: false, message: "Invalid order id" };

    const order = await this.repo.findOrderById(orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.status === "cancelled")
      return { success: false, message: "Cannot update a cancelled order" };
    if (order.status === "delivered")
      return { success: false, message: "Order already delivered" };

    const updated = await this.repo.updateOrderStatus(orderId, status);
    return { success: true, message: "Order updated", data: updated };
  }

  async getDriversWithStats(params?: { search?: string }) {
    const drivers = await this.repo.getDrivers(params);
    const statsMap = await this.repo.getDriversStats();

    const enriched = drivers.map((d: any) => ({
      ...d,
      totalAssigned: statsMap?.[String(d._id)]?.totalAssigned ?? 0,
      deliveredCount: statsMap?.[String(d._id)]?.deliveredCount ?? 0,
    }));

    return { success: true, data: enriched };
  }

  async getDriverStatsById(driverId: string) {
    if (!mongoose.Types.ObjectId.isValid(driverId))
      return { success: false, message: "Invalid driver id" };

    const stats = await this.repo.getDriverStatsById(driverId);
    return { success: true, data: stats };
  }
}
