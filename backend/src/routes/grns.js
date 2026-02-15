import express from "express";
import GRN from "../models/GRN.js";
import GRNLine from "../models/GRNLine.js";
import StockLot from "../models/StockLot.js";
import { requireAuth, requireRole, enforceStoreScope } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

// list
router.get("/", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId, from, to, supplierId } = req.query;

  const q = {};
  if (storeId) q.storeId = storeId;
  if (supplierId) q.supplierId = supplierId;
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) q.date.$lte = new Date(to);

  const grns = await GRN.find(q)
    .populate("storeId", "name")
    .populate("supplierId", "name")
    .sort({ date: -1 });
  res.json({ grns });
});

// get one
router.get("/:id", requireAuth, async (req, res) => {
  const grn = await GRN.findById(req.params.id);
  if (!grn) return res.status(404).json({ message: "Not found" });

  // scope
  if (req.user.role !== "ADMIN" && req.user.role !== "ACCOUNTS_VIEW") {
    if (req.user.role !== "STORE_KEEPER" || req.user.storeId) {
      if (String(req.user.storeId) !== String(grn.storeId)) return res.status(403).json({ message: "Forbidden" });
    }
  }

  const lines = await GRNLine.find({ grnId: grn._id });
  res.json({ grn, lines });
});

// create draft
router.post("/", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), enforceStoreScope, async (req, res) => {
  const { storeId, supplierId, date, note, lines } = req.body;

  const grn = await GRN.create({
    storeId,
    supplierId,
    grnNo: makeCode("GRN"),
    date: new Date(date),
    status: "DRAFT",
    note
  });

  let subTotal = 0;
  for (const ln of lines || []) {
    const lineTotal = Number(ln.qtyReceived) * Number(ln.unitCost);
    subTotal += lineTotal;
    await GRNLine.create({
      grnId: grn._id,
      itemId: ln.itemId,
      qtyReceived: ln.qtyReceived,
      unitCost: ln.unitCost,
      lineTotal
    });
  }

  grn.totals = { subTotal, grandTotal: subTotal };
  await grn.save();

  res.json({ grn });
});

// update draft only
router.put("/:id", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const grn = await GRN.findById(req.params.id);
  if (!grn) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "ADMIN") {
    if (req.user.role === "STORE_KEEPER" && req.user.storeId && String(req.user.storeId) !== String(grn.storeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (grn.status !== "DRAFT") return res.status(400).json({ message: "Only DRAFT GRN can be edited" });

  const { supplierId, date, note, lines } = req.body;

  grn.supplierId = supplierId ?? grn.supplierId;
  grn.date = date ? new Date(date) : grn.date;
  grn.note = note ?? grn.note;
  await grn.save();

  // replace lines
  await GRNLine.deleteMany({ grnId: grn._id });

  let subTotal = 0;
  for (const ln of lines || []) {
    const lineTotal = Number(ln.qtyReceived) * Number(ln.unitCost);
    subTotal += lineTotal;
    await GRNLine.create({ grnId: grn._id, itemId: ln.itemId, qtyReceived: ln.qtyReceived, unitCost: ln.unitCost, lineTotal });
  }

  grn.totals = { subTotal, grandTotal: subTotal };
  await grn.save();

  res.json({ grn });
});

// delete draft only (safe MVP)
router.delete("/:id", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const grn = await GRN.findById(req.params.id);
  if (!grn) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "ADMIN") {
    if (req.user.role === "STORE_KEEPER" && req.user.storeId && String(req.user.storeId) !== String(grn.storeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (grn.status !== "DRAFT") return res.status(400).json({ message: "Only DRAFT GRN can be deleted" });

  await GRNLine.deleteMany({ grnId: grn._id });
  await GRN.deleteOne({ _id: grn._id });
  res.json({ message: "✅ Deleted" });
});

// POST GRN -> create lots
router.post("/:id/post", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const grn = await GRN.findById(req.params.id);
  if (!grn) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "ADMIN") {
    if (req.user.role === "STORE_KEEPER" && req.user.storeId && String(req.user.storeId) !== String(grn.storeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (grn.status === "POSTED") return res.json({ message: "Already posted" });

  const lines = await GRNLine.find({ grnId: grn._id });

  for (const ln of lines) {
    await StockLot.create({
      storeId: grn.storeId,
      itemId: ln.itemId,
      grnId: grn._id,
      grnNo: grn.grnNo,
      qtyIn: ln.qtyReceived,
      qtyOut: 0,
      qtyBalance: ln.qtyReceived,
      unitCost: ln.unitCost,
      receivedAt: grn.date
    });
  }

  grn.status = "POSTED";
  await grn.save();

  res.json({ message: "✅ Posted", grnNo: grn.grnNo });
});

export default router;
