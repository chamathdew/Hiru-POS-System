import express from "express";
import Store from "../models/Store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const stores = await Store.find().sort({ name: 1 });
  res.json({ stores });
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, location } = req.body;
    const code = makeCode("STR");
    const store = await Store.create({ code, name, location });
    res.json({ store });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
