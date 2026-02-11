import express from "express";
import Request from "../models/Request.js";
import RequestLine from "../models/RequestLine.js";
import Issue from "../models/Issue.js";
import IssueLine from "../models/IssueLine.js";
import StockLot from "../models/StockLot.js";
import { requireAuth, requireRole, enforceStoreScope } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

// list
router.get("/", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, from, to } = req.query;

  const q = {};
  if (storeId) q.storeId = storeId;
  if (departmentId) q.departmentId = departmentId;
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) q.date.$lte = new Date(to);

  const issues = await Issue.find(q).sort({ date: -1 });
  res.json({ issues });
});

// create issue
// body: { storeId, requestId, departmentId, date, lines:[{ requestLineId, itemId, stockLotId, qty }] }
router.post("/", requireAuth, requireRole("ADMIN","STORE_KEEPER"), enforceStoreScope, async (req, res) => {
  const { storeId, requestId, departmentId, date, lines } = req.body;

  const request = await Request.findById(requestId);
  if (!request) return res.status(404).json({ message: "Request not found" });

  if (String(request.storeId) !== String(storeId)) return res.status(400).json({ message: "Request store mismatch" });
  if (String(request.departmentId) !== String(departmentId)) return res.status(400).json({ message: "Department mismatch" });

  if (!["APPROVED","PARTIALLY_ISSUED"].includes(request.status)) {
    return res.status(400).json({ message: "Request not approved" });
  }

  // Validate & calculate
  let grandTotal = 0;

  const issue = await Issue.create({
    storeId,
    departmentId,
    requestId,
    issueNo: makeCode("ISS"),
    issuedBy: req.user._id,
    date: new Date(date),
    totals: { grandTotal: 0 }
  });

  for (const ln of lines || []) {
    const qty = Number(ln.qty);
    if (!(qty > 0)) continue;

    const rl = await RequestLine.findById(ln.requestLineId);
    if (!rl || String(rl.requestId) !== String(request._id)) continue;

    // remaining = approved - issued
    const remaining = Math.max(0, Number(rl.qtyApproved) - Number(rl.qtyIssued));
    if (qty > remaining) {
      return res.status(400).json({ message: "Issue qty exceeds remaining approved qty" });
    }

    const lot = await StockLot.findById(ln.stockLotId);
    if (!lot) return res.status(404).json({ message: "Stock lot not found" });
    if (String(lot.storeId) !== String(storeId)) return res.status(400).json({ message: "Lot store mismatch" });
    if (String(lot.itemId) !== String(rl.itemId)) return res.status(400).json({ message: "Lot item mismatch" });

    if (Number(lot.qtyBalance) < qty) {
      return res.status(400).json({ message: `Not enough stock in GRN lot ${lot.grnNo}` });
    }

    // Deduct lot
    lot.qtyOut = Number(lot.qtyOut) + qty;
    lot.qtyBalance = Number(lot.qtyBalance) - qty;
    await lot.save();

    const lineTotal = qty * Number(lot.unitCost);
    grandTotal += lineTotal;

    await IssueLine.create({
      issueId: issue._id,
      requestLineId: rl._id,
      itemId: rl.itemId,
      stockLotId: lot._id,
      grnNo: lot.grnNo,
      qty,
      unitCost: lot.unitCost,
      lineTotal
    });

    // Update request line
    rl.qtyIssued = Number(rl.qtyIssued) + qty;
    await rl.save();
  }

  // Update issue totals
  issue.totals.grandTotal = grandTotal;
  await issue.save();

  // Update request status (PARTIALLY_ISSUED / CLOSED)
  const allLines = await RequestLine.find({ requestId: request._id });
  const fullyIssued = allLines.every(l => Number(l.qtyApproved) > 0 && Number(l.qtyIssued) >= Number(l.qtyApproved));
  const anyIssued = allLines.some(l => Number(l.qtyIssued) > 0);

  request.status = fullyIssued ? "CLOSED" : (anyIssued ? "PARTIALLY_ISSUED" : request.status);
  await request.save();

  res.json({ issue, grandTotal, requestStatus: request.status });
});

export default router;
