import mongoose from "mongoose";

const StockLotSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    grnId: { type: mongoose.Schema.Types.ObjectId, ref: "GRN", required: true },
    grnNo: { type: String, required: true },

    qtyIn: { type: Number, required: true },
    qtyOut: { type: Number, default: 0 },
    qtyBalance: { type: Number, required: true },

    unitCost: { type: Number, required: true },
    receivedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("StockLot", StockLotSchema);
