import express from "express";
import IssueLine from "../models/IssueLine.js";
import Issue from "../models/Issue.js";
import { requireAuth, requireRole, enforceStoreScope } from "../middleware/auth.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const router = express.Router();

async function departmentConsumption({ storeId, departmentId, from, to }) {
  const issueQ = { storeId };
  if (departmentId) issueQ.departmentId = departmentId;
  if (from || to) issueQ.date = {};
  if (from) issueQ.date.$gte = new Date(from);
  if (to) issueQ.date.$lte = new Date(to);

  const issues = await Issue.find(issueQ).select("_id");
  const issueIds = issues.map(i => i._id);

  const rows = await IssueLine.aggregate([
    { $match: { issueId: { $in: issueIds } } },
    {
      $group: {
        _id: { itemId: "$itemId", grnNo: "$grnNo" },
        qty: { $sum: "$qty" },
        value: { $sum: "$lineTotal" }
      }
    },
    {
      $lookup: {
        from: "items",
        localField: "_id.itemId",
        foreignField: "_id",
        as: "item"
      }
    },
    { $unwind: "$item" }
  ]);

  return rows.map(r => ({
    itemId: String(r._id.itemId),
    itemName: r.item.name,
    itemCode: r.item.code,
    grnNo: r._id.grnNo,
    qty: r.qty,
    value: r.value
  }));
}

router.get("/department-consumption", requireAuth, enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, from, to } = req.query;
  if (!storeId) return res.status(400).json({ message: "storeId required" });

  const data = await departmentConsumption({ storeId, departmentId, from, to });
  res.json({ data, currency: "LKR" });
});

// CSV download (accounts allowed)
router.get("/department-consumption.csv", requireAuth, requireRole("ADMIN", "STORE_KEEPER", "ACCOUNTS_VIEW"), enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, from, to } = req.query;
  if (!storeId) return res.status(400).json({ message: "storeId required" });

  const data = await departmentConsumption({ storeId, departmentId, from, to });

  const parser = new Parser({ fields: ["itemId", "grnNo", "qty", "value"] });
  const csv = parser.parse(data);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="department-consumption.csv"`);
  res.send(csv);
});

// PDF download (simple)
router.get("/department-consumption.pdf", requireAuth, requireRole("ADMIN", "STORE_KEEPER", "ACCOUNTS_VIEW"), enforceStoreScope, async (req, res) => {
  const { storeId, departmentId, from, to } = req.query;
  if (!storeId) return res.status(400).json({ message: "storeId required" });

  const data = await departmentConsumption({ storeId, departmentId, from, to });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="department-consumption.pdf"`);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(16).text("Department Consumption Report", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Store: ${storeId}  Dept: ${departmentId || "ALL"}  From: ${from || "-"}  To: ${to || "-"}`);
  doc.moveDown();

  doc.fontSize(11).text("itemId        grnNo              qty        value(LKR)");
  doc.moveDown(0.5);

  let total = 0;
  data.forEach(r => {
    total += Number(r.value || 0);
    doc.text(`${r.itemId}   ${String(r.grnNo).padEnd(16)}   ${r.qty}   ${r.value}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Grand Total (LKR): ${total.toFixed(2)}`);

  doc.end();
});

export default router;
