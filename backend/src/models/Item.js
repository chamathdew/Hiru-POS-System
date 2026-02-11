import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    unit: { type: String, default: "pcs" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Item", ItemSchema);
