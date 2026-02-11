import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

async function main() {
  await connectDB(process.env.MONGO_URI);

  const email = "admin@hiru.lk";
  const password = "Admin@123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("✅ Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: "Hiru Admin",
    email,
    passwordHash,
    role: "ADMIN",
    storeId: null
  });

  console.log("✅ Admin created:", email, password);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
