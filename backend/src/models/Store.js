import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    location: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Store", StoreSchema);
