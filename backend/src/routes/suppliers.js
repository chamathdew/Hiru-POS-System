import express from "express";
import Supplier from "../models/Supplier.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
  res.json({ suppliers });
});

router.post("/", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  try {
    const code = makeCode("SUP");
    const supplier = await Supplier.create({ ...req.body, code });
    res.json({ supplier });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ supplier });
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json({ supplier });
});

export default router;
