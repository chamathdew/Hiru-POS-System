import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    issueNo: { type: String, required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    totals: { grandTotal: { type: Number, default: 0 } }
  },
  { timestamps: true }
);

IssueSchema.index({ storeId: 1, issueNo: 1 }, { unique: true });

export default mongoose.model("Issue", IssueSchema);
