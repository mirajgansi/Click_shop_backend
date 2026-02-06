import { z } from "zod";
import { OrderSchema, OrderStatusSchema } from "../types/order";

/**
 * CREATE ORDER DTO
 *  Client should only send checkout info (payment/shipping/notes)
 *  Client should NOT send items/subtotal/total (backend computes from cart)
 */
export const CreateOrderDto = OrderSchema.pick({
  shippingFee: true,
  shippingAddress: true,
  notes: true,
}).extend({
  shippingFee: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateOrderDto = OrderSchema.partial();

/**
 * ADMIN: Update Status DTO (recommended)
 *  safer than allowing full partial updates
 */

export const UpdateOrderStatusDto = z
  .object({
    status: OrderStatusSchema,
    paymentStatus: z.enum(["unpaid", "paid"]).optional(),

    driverId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // require driver when shipping
    if (data.status === "shipped" && !data.driverId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["driverId"],
        message: "driverId is required when status is shipped",
      });
    }

    // optional: prevent driverId on cancelled/pending if you want
    // if (data.status === "cancelled" && data.driverId) { ... }
  });
export const AssignDriverDto = z.object({
  driverId: z.string().min(1, "driverId is required"),
});
export type AssignDriverDto = z.infer<typeof AssignDriverDto>;

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderDto>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;
