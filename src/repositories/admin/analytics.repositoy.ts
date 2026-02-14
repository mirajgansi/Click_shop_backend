import { PipelineStage } from "mongoose";
import { OrderModel } from "../../models/order.model";

export class AdminAnalyticsRepository {
  async aggregate<T = any>(pipeline: PipelineStage[]) {
    return OrderModel.aggregate<T>(pipeline);
  }
}
