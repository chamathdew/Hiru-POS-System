import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

DepartmentSchema.index({ storeId: 1, name: 1 }, { unique: true });

export default mongoose.model("Department", DepartmentSchema);
