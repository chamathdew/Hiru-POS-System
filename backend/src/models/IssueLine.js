import mongoose from "mongoose";

const IssueLineSchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    requestLineId: { type: mongoose.Schema.Types.ObjectId, ref: "RequestLine", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    stockLotId: { type: mongoose.Schema.Types.ObjectId, ref: "StockLot", required: true },
    grnNo: { type: String, required: true },
    qty: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    lineTotal: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("IssueLine", IssueLineSchema);
