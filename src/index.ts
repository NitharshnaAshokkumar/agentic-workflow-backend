import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import workflowsRouter from "./routes/workflows";
import executionsRouter from "./routes/executions";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/workflows", workflowsRouter);
app.use("/api/executions", executionsRouter);

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`✅ Backend running http://localhost:${PORT}`));
