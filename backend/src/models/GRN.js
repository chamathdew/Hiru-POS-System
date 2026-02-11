import mongoose from "mongoose";

const GRNSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    grnNo: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["DRAFT", "POSTED"], default: "DRAFT" },
    note: String,
    totals: { subTotal: { type: Number, default: 0 }, grandTotal: { type: Number, default: 0 } }
  },
  { timestamps: true }
);

GRNSchema.index({ storeId: 1, grnNo: 1 }, { unique: true });

export default mongoose.model("GRN", GRNSchema);
