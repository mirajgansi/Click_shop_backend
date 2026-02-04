import { Types } from "mongoose";
import { OrderModel } from "../models/order.model";

export class OrderRepository {
  create(payload: any, session?: any) {
    // create() with session (transaction-safe)
    return OrderModel.create([payload], session ? { session } : undefined).then(
      (r) => r[0],
    );
  }

  findByUserId(userId: string) {
    return OrderModel.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
  }

  findById(orderId: string) {
    return OrderModel.findById(orderId);
  }

  findAll() {
    return OrderModel.find().sort({ createdAt: -1 });
  }

  updateStatus(
    orderId: string,
    update: { status: string; paymentStatus?: string },
  ) {
    return OrderModel.findByIdAndUpdate(orderId, update, { new: true });
  }
}
