import mongoose, { Schema } from "mongoose";

const DriverProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
      index: true,
    },

    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const DriverProfileModel =
  mongoose.models.DriverProfile ||
  mongoose.model("DriverProfile", DriverProfileSchema);

export default DriverProfileModel;
