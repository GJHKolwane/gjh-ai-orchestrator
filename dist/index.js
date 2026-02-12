import express from "express";
import { nurseTriageHandler } from "./handlers/triage.handler.js";
import { prescriptionHandler } from "./handlers/prescription.handler.js";
const app = express();
const PORT = Number(process.env.PORT) || 8080;
app.use(express.json());
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "gjh-ai-orchestrator",
        region: process.env.GCP_REGION || "europe-west1",
        timestamp: new Date().toISOString()
    });
});
app.post("/triage/nurse", async (req, res) => {
    try {
        await nurseTriageHandler(req, res);
    }
    catch (err) {
        console.error("Unhandled handler error:", err);
        res.status(500).json({ error: "Unhandled server error" });
    }
});
app.post("/prescribe", prescriptionHandler);
/**
 * Cloud Run requires:
 * - Listening on process.env.PORT
 * - Binding to 0.0.0.0
 */
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 GJHealth AI Orchestrator running on port ${PORT}`);
});
