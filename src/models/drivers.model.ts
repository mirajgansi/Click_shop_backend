import mongoose, { Schema } from "mongoose";

const DriverProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "van", "truck"],
      required: true,
    },

    vehicleNumber: { type: String, trim: true },
    licenseNo: { type: String, trim: true }, // optional

    isAvailable: { type: Boolean, default: true }, // optional (future)
  },
  { timestamps: true },
);

export const DriverProfileModel = mongoose.model(
  "DriverProfile",
  DriverProfileSchema,
);
