import express from "express";
import Item from "../models/Item.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await Item.find({ isActive: true }).sort({ name: 1 });
  res.json({ items });
});

router.post("/", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  try {
    const { name, category, unit } = req.body;
    // Use user-provided code or generate one
    const code = req.body.code || makeCode("ITM");
    const item = await Item.create({ code, name, category, unit });
    res.json({ item });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ item });
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json({ item });
});

export default router;
