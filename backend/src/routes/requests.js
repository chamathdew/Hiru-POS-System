import express from "express";
import Request from "../models/Request.js";
import RequestLine from "../models/RequestLine.js";
import Department from "../models/Department.js";
import { requireAuth, requireRole, enforceStoreScope } from "../middleware/auth.js";
import { makeCode } from "../utils/ids.js";

const router = express.Router();

// list
router.get("/", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, status, from, to } = req.query;

  const q = {};
  if (storeId) q.storeId = storeId;
  if (departmentId) q.departmentId = departmentId;
  if (status) q.status = status;
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) q.date.$lte = new Date(to);

  const requests = await Request.find(q)
    .populate("departmentId", "name")
    .populate("requestedBy", "name")
    .sort({ date: -1 });
  res.json({ requests });
});

// get one
router.get("/:id", requireAuth, async (req, res) => {
  const r = await Request.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Not found" });

  // scope
  if (req.user.role !== "ADMIN" && req.user.role !== "ACCOUNTS_VIEW") {
    if (req.user.role !== "STORE_KEEPER" || req.user.storeId) {
      if (String(req.user.storeId) !== String(r.storeId)) return res.status(403).json({ message: "Forbidden" });
    }
  }

  const lines = await RequestLine.find({ requestId: r._id }).populate("itemId", "name code");
  res.json({ request: r, lines });
});

// create (department user or store keeper/admin)
router.post("/", requireAuth, requireRole("ADMIN", "STORE_KEEPER", "DEPT_USER"), enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, date, note, lines } = req.body;

  // validate department belongs to store
  const dep = await Department.findById(departmentId);
  if (!dep || String(dep.storeId) !== String(storeId)) return res.status(400).json({ message: "Invalid department/store" });

  const request = await Request.create({
    storeId,
    departmentId,
    requestNo: makeCode("REQ"),
    requestedBy: req.user._id,
    date: new Date(date),
    status: "SUBMITTED",
    note
  });

  for (const ln of lines || []) {
    await RequestLine.create({
      requestId: request._id,
      itemId: ln.itemId,
      qtyRequested: Number(ln.qtyRequested),
      qtyApproved: 0,
      qtyIssued: 0
    });
  }

  res.json({ request });
});

// approve (store keeper)
router.put("/:id/approve", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const r = await Request.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "ADMIN") {
    if (req.user.role === "STORE_KEEPER" && req.user.storeId && String(req.user.storeId) !== String(r.storeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (!["SUBMITTED", "PARTIALLY_ISSUED"].includes(r.status)) {
    return res.status(400).json({ message: "Invalid status to approve" });
  }

  // body: { approvals: [{ requestLineId, qtyApproved }] }
  const approvals = req.body.approvals || [];
  for (const a of approvals) {
    const rl = await RequestLine.findById(a.requestLineId);
    if (!rl) continue;
    if (String(rl.requestId) !== String(r._id)) continue;

    const approved = Math.max(0, Number(a.qtyApproved));
    rl.qtyApproved = approved;
    if (rl.qtyIssued > rl.qtyApproved) rl.qtyIssued = rl.qtyApproved; // safety
    await rl.save();
  }

  r.status = "APPROVED";
  await r.save();

  res.json({ request: r });
});

// reject
router.put("/:id/reject", requireAuth, requireRole("ADMIN", "STORE_KEEPER"), async (req, res) => {
  const r = await Request.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "ADMIN") {
    if (req.user.role === "STORE_KEEPER" && req.user.storeId && String(req.user.storeId) !== String(r.storeId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  r.status = "REJECTED";
  await r.save();
  res.json({ request: r });
});

export default router;
