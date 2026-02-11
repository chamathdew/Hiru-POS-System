import express from "express";
import Department from "../models/Department.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { storeId } = req.query;
  const q = storeId ? { storeId } : {};
  const departments = await Department.find(q).populate("storeId").sort({ name: 1 });
  res.json({ departments });
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { name, storeId } = req.body;
    const code = makeCode("DEPT");
    const department = await Department.create({ code, name, storeId });
    res.json({ department });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
