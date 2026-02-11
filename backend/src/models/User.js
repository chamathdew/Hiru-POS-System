import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "STORE_KEEPER", "DEPT_USER", "ACCOUNTS_VIEW"], required: true },
    // Store keeper single login => storeId can be null (means: can access all stores)
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
