import mongoose from "mongoose";

const RequestLineSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    qtyRequested: { type: Number, required: true },
    qtyApproved: { type: Number, default: 0 },
    qtyIssued: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("RequestLine", RequestLineSchema);
