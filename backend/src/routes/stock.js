import express from "express";
import StockLot from "../models/StockLot.js";
import { requireAuth, enforceStoreScope } from "../middleware/auth.js";

const router = express.Router();

router.get("/lots", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId, itemId } = req.query;
  if (!storeId) return res.status(400).json({ message: "storeId required" });
  if (!itemId) return res.status(400).json({ message: "itemId required" });

  const lots = await StockLot.find({ storeId, itemId, qtyBalance: { $gt: 0 } }).sort({ receivedAt: 1 });
  res.json({ lots });
});

router.get("/summary", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ message: "storeId required" });

  const rows = await StockLot.aggregate([
    { $match: { storeId: typeof storeId === "string" ? (await import("mongoose")).default.Types.ObjectId.createFromHexString(storeId) : storeId } },
    {
      $group: {
        _id: "$itemId",
        qtyBalance: { $sum: "$qtyBalance" },
        stockValue: { $sum: { $multiply: ["$qtyBalance", "$unitCost"] } }
      }
    }
  ]);

  res.json({ rows });
});

export default router;
