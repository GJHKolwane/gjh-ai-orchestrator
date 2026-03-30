import express from "express";
import cors from "cors";
import "dotenv/config";

import assistRoute from "./routes/assist.route";

const app = express();
const PORT = Number(process.env.PORT) || 8087;

app.use(cors());
app.use(express.json());

/*
================================
HEALTH CHECK
================================
*/
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "gjh-ai-orchestrator",
    timestamp: new Date().toISOString()
  });
});

/*
================================
AI ASSIST ONLY
================================
*/
app.use("/ai", assistRoute);

/*
================================
START SERVER
================================
*/
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 AI Orchestrator running on port ${PORT}`);
});
