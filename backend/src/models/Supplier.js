import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: String,
    contact: String, // Matching frontend form
    address: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", SupplierSchema);
