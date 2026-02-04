import mongoose, { Types } from "mongoose";
import { OrderModel } from "../models/order.model";
import { CartModel } from "../models/cart.model";
import { ProductModel } from "../models/product.model"; // ✅ adjust path/name if different
import { CreateOrderDto } from "../dtos/order.dto";
import { HttpError } from "../errors/http-error";

type CreateOrderInput = {
  paymentMethod?: "cod" | "stripe" | "paypal";
  shippingFee?: number;
  shippingAddress?: any;
  notes?: string;
};

export class OrderService {
  async createFromCart(userId: string, input: CreateOrderInput) {
    if (!userId) throw new HttpError(401, "Unauthorized");

    const parsed = CreateOrderDto.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid input");
    }

    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // 1) Load cart + populate products
        const cart = await CartModel.findOne({ userId })
          .populate("items.productId")
          .session(session);

        if (!cart || !cart.items?.length) {
          throw new HttpError(400, "Cart is empty");
        }

        // 2) Build snapshot items + update product metrics
        const orderItems = [];

        for (const it of cart.items as any[]) {
          const p = it.productId; // populated Product doc
          if (!p) throw new HttpError(400, "Product not found in cart");

          const qty = Number(it.quantity) || 1;

          //  Stock check
          if ((p.inStock ?? 0) < qty) {
            throw new HttpError(400, `Not enough stock for ${p.name}`);
          }

          const price = Number(p.price) || 0;
          const lineTotal = price * qty;

          //  Snapshot item
          orderItems.push({
            productId: p._id,
            name: p.name,
            price,
            image: p.image,
            quantity: qty,
            lineTotal,
          });

          // Update product fields (stock + analytics)
          // IMPORTANT: update in DB using $inc to be safe
          const updateRes = await ProductModel.updateOne(
            { _id: p._id, inStock: { $gte: qty } }, // guard again
            {
              $inc: {
                inStock: -qty,
                totalSold: qty,
                totalRevenue: lineTotal,
              },
            },
            { session },
          );

          if (updateRes.modifiedCount !== 1) {
            throw new HttpError(400, `Stock update failed for ${p.name}`);
          }
        }

        // 3) Re-check availability flag for products that hit 0 stock (optional but useful)
        // If you want available auto-managed:
        const productIds = orderItems.map((x: any) => x.productId);
        await ProductModel.updateMany(
          { _id: { $in: productIds }, inStock: { $lte: 0 } },
          { $set: { available: false } },
          { session },
        );
        await ProductModel.updateMany(
          { _id: { $in: productIds }, inStock: { $gt: 0 } },
          { $set: { available: true } },
          { session },
        );

        // 4) Totals
        const subtotal = orderItems.reduce(
          (s: number, it: any) => s + it.lineTotal,
          0,
        );
        const shippingFee = Number(parsed.data.shippingFee ?? 0);
        const total = subtotal + shippingFee;

        // 5) Create order
        const [order] = await OrderModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              items: orderItems,
              subtotal,
              shippingFee,
              total,
              status: "pending",
              paymentStatus: "unpaid",
              shippingAddress: parsed.data.shippingAddress,
              notes: parsed.data.notes,
            },
          ],
          { session },
        );

        // 6) Clear cart
        await CartModel.updateOne(
          { userId },
          { $set: { items: [] } },
          { session },
        );
        return order;
      });

      return result;
    } finally {
      session.endSession();
    }
  }

  async getMyOrders(userId: string) {
    if (!userId) throw new HttpError(401, "Unauthorized");
    return OrderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string) {
    if (!orderId) throw new HttpError(400, "Order id is required");
    const order = await OrderModel.findById(orderId);
    if (!order) throw new HttpError(404, "Order not found");
    return order;
  }

  // Admin
  async getAllOrders() {
    return OrderModel.find().sort({ createdAt: -1 });
  }

  // Admin
  async updateStatus(
    orderId: string,
    payload: { status: string; paymentStatus?: string },
  ) {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: payload.status,
        ...(payload.paymentStatus
          ? { paymentStatus: payload.paymentStatus }
          : {}),
      },
      { new: true },
    );

    if (!order) throw new HttpError(404, "Order not found");
    return order;
  }
}
