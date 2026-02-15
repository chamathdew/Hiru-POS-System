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

router.get("/", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId } = req.query;
  const q = {};
  if (storeId) q.storeId = (await import("mongoose")).default.Types.ObjectId.createFromHexString(storeId);

  const rows = await StockLot.aggregate([
    { $match: { ...q, qtyBalance: { $gt: 0 } } },
    {
      $group: {
        _id: { storeId: "$storeId", itemId: "$itemId" },
        qty: { $sum: "$qtyBalance" },
        updatedAt: { $max: "$updatedAt" }
      }
    },
    {
      $lookup: {
        from: "items",
        localField: "_id.itemId",
        foreignField: "_id",
        as: "itemId"
      }
    },
    { $unwind: "$itemId" },
    {
      $lookup: {
        from: "stores",
        localField: "_id.storeId",
        foreignField: "_id",
        as: "storeId"
      }
    },
    { $unwind: "$storeId" },
    {
      $project: {
        _id: 1,
        qty: 1,
        updatedAt: 1,
        "itemId.name": 1,
        "itemId.code": 1,
        "itemId._id": 1,
        "storeId.name": 1,
        "storeId._id": 1
      }
    }
  ]);

  res.json({ stock: rows });
});

export default router;
