import mongoose from "mongoose";

const GRNLineSchema = new mongoose.Schema(
  {
    grnId: { type: mongoose.Schema.Types.ObjectId, ref: "GRN", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    qtyReceived: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("GRNLine", GRNLineSchema);
