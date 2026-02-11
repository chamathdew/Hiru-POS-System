import mongoose from "mongoose";

function sanitizeMongoUri(uri) {
  if (!uri || typeof uri !== "string") return uri;

  // Remove accidental quotes/spaces
  let cleaned = uri.trim().replace(/^['"]|['"]$/g, "");

  // Common mistake: adding a port to mongodb+srv (SRV records cannot include a port)
  // Example: mongodb+srv://user:pass@cluster.mongodb.net:27017/db -> remove :27017
  if (cleaned.startsWith("mongodb+srv://")) {
    cleaned = cleaned.replace(
      /^(mongodb\+srv:\/\/[^@]+@[^\/:]+):\d+(\/.*)?$/i,
      (_m, prefix, rest) => `${prefix}${rest || ""}`
    );
  }

  return cleaned;
}

export async function connectDB(uri) {
  const finalUri = sanitizeMongoUri(uri);

  if (!finalUri) {
    throw new Error(
      "MONGO_URI is missing. Add it to backend/.env (e.g., mongodb+srv://<user>:<pass>@<cluster>/<db>)"
    );
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(finalUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    // Make the common SRV+port issue obvious
    const msg = String(err?.message || err);
    if (finalUri.startsWith("mongodb+srv://") && /port number/i.test(msg)) {
      console.error(
        "❌ MongoDB connection failed: Your MONGO_URI uses mongodb+srv but includes a port. Remove the :<port> part and try again."
      );
    }
    console.error("❌ MongoDB connection failed:", err.message);
    // Do not throw error to allow server to start for frontend development
    // throw err; 
  }
}
