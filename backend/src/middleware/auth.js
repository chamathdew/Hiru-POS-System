import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.uid);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// Store scope rules:
// - ADMIN + ACCOUNTS_VIEW => all stores
// - STORE_KEEPER with storeId = null => all stores (single login, hotel selection in UI)
// - Others => must match own store
export function enforceStoreScope(req, res, next) {
  const role = req.user.role;

  if (role === "ADMIN" || role === "ACCOUNTS_VIEW") return next();
  if (role === "STORE_KEEPER" && !req.user.storeId) return next();

  const storeId = req.query.storeId || req.body.storeId;
  if (!storeId) return res.status(400).json({ message: "storeId required" });

  if (String(req.user.storeId) !== String(storeId)) {
    return res.status(403).json({ message: "Store scope violation" });
  }
  next();
}
