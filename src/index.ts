import express from "express";
import bodyParser from "body-parser";
import { nurseTriageHandler } from "./handlers/triage.handler";

/**
 * Main HTTP entry point for GJHealth AI Orchestrator
 *
 * This service exposes governed AI pipelines over HTTP.
 */

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

/**
 * Health check
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Nurse-first AI triage endpoint
 */
app.post("/triage/nurse", nurseTriageHandler);

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 GJHealth AI Orchestrator running on port ${PORT}`);
});
