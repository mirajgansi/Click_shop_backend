import { Types } from "mongoose";
import { OrderModel } from "../models/order.model";

export class OrderRepository {
  async create(payload: any, session?: any) {
    return OrderModel.create([payload], session ? { session } : undefined).then(
      (r) => r[0],
    );
  }

  async findByUserIdPaginated(userId: string, page = 1, size = 10) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeSize = Math.min(100, Math.max(1, Number(size) || 10));
    const skip = (safePage - 1) * safeSize;

    const filter = { userId: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeSize),
      OrderModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page: safePage,
        size: safeSize,
        total,
        totalPages: Math.ceil(total / safeSize),
      },
    };
  }
  async findById(orderId: string) {
    return OrderModel.findById(orderId);
  }

  async findAll({
    page = 1,
    size = 10,
    search,
  }: {
    page: number;
    size: number;
    search?: string;
  }) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, size));
    const skip = (safePage - 1) * safeSize;

    const filter: any = {};
    if (search?.trim()) {
      const q = search.trim();
      filter.$or = [
        { "shippingAddress.userName": { $regex: q, $options: "i" } },
        { "shippingAddress.address1": { $regex: q, $options: "i" } },
        { "items.name": { $regex: q, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeSize),
      OrderModel.countDocuments(filter),
    ]);

    return { orders, total };
  }

  async updateStatus(
    orderId: string,
    update: { status: string; paymentStatus?: string },
  ) {
    return OrderModel.findByIdAndUpdate(orderId, update, { new: true });
  }
}
