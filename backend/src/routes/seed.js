import express from "express";
import Store from "../models/Store.js";
import Department from "../models/Department.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

const STORES = ["Hiru Villa", "Hiru Om", "Hiru Mudhra", "Hiru Aadya", "Athurualle"];
const DEPTS = ["Ayurveda", "Kitchen", "Restaurant", "Front Office", "Garden", "Maintenance", "Housekeeping"];

router.post("/seed-stores-depts", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const stores = [];
  for (const name of STORES) {
    const s = await Store.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    stores.push(s);
  }

  let upserted = 0;
  for (const store of stores) {
    for (const name of DEPTS) {
      await Department.findOneAndUpdate(
        { storeId: store._id, name },
        { storeId: store._id, name, isActive: true },
        { upsert: true, new: true }
      );
      upserted++;
    }
  }

  res.json({ stores: stores.map(s => ({ id: s._id, name: s.name })), departmentsUpserted: upserted });
});

export default router;
