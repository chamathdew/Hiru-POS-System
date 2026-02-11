import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    requestNo: { type: String, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["SUBMITTED", "APPROVED", "REJECTED", "PARTIALLY_ISSUED", "CLOSED"], default: "SUBMITTED" },
    note: String
  },
  { timestamps: true }
);

RequestSchema.index({ storeId: 1, requestNo: 1 }, { unique: true });

export default mongoose.model("Request", RequestSchema);
