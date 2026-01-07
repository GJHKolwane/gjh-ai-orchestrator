import express from "express";
import bodyParser from "body-parser";
import { nurseTriageHandler } from "./handlers/triage.handler.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(bodyParser.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/triage/nurse", async (req, res) => {
  try {
    await nurseTriageHandler(req, res);
  } catch (err) {
    console.error("Unhandled handler error:", err);
    res.status(500).json({ error: "Unhandled server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GJHealth AI Orchestrator running on port ${PORT}`);
});
