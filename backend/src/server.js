import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import seedRoutes from "./routes/seed.js";
import storesRoutes from "./routes/stores.js";
import departmentsRoutes from "./routes/departments.js";
import suppliersRoutes from "./routes/suppliers.js";
import itemsRoutes from "./routes/items.js";
import grnsRoutes from "./routes/grns.js";
import requestsRoutes from "./routes/requests.js";
import issuesRoutes from "./routes/issues.js";
import stockRoutes from "./routes/stock.js";
import reportsRoutes from "./routes/reports.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.send("Hiru POS API ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/grns", grnsRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/reports", reportsRoutes);

await connectDB(process.env.MONGO_URI);

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ API running on http://localhost:${process.env.PORT || 5000}`);
});
