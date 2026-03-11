import express, { Request, Response } from "express";
import cors from "cors";

import { nurseTriageHandler } from "./handlers/triage.handler.js";
import { prescriptionHandler } from "./handlers/prescription.handler.js";

import { sendHeartbeat } from "./offline/heartbeatSender.js";

const app = express();
const PORT = Number(process.env.PORT) || 8087;

/*
================================================
MIDDLEWARE
================================================
*/

app.use(cors());
app.use(express.json());

/*
================================================
HEALTH CHECK
================================================
*/

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "gjh-ai-orchestrator",
    region: process.env.GCP_REGION || "europe-west1",
    timestamp: new Date().toISOString()
  });
});

/*
================================================
CLINICAL WORKFLOW ENDPOINTS
These receive requests from the Dashboard.
For now they simply acknowledge requests.
Handlers will later forward to Case Service.
================================================
*/

app.post("/clinical/intake", async (req: Request, res: Response) => {

  const { omang } = req.body;

  if (!omang) {
    return res.status(400).json({
      error: "omang required"
    });
  }

  /*
  Later this will:
  - lookup patient
  - create patient if missing
  - create encounter
  */

  res.json({
    status: "accepted",
    omang
  });

});

app.post("/clinical/vitals", async (req: Request, res: Response) => {

  const { encounterId, vitals } = req.body;

  if (!encounterId) {
    return res.status(400).json({
      error: "encounterId required"
    });
  }

  res.json({
    status: "accepted",
    encounterId,
    vitals
  });

});

app.post("/clinical/symptoms", async (req: Request, res: Response) => {

  const { encounterId, symptoms } = req.body;

  if (!encounterId) {
    return res.status(400).json({
      error: "encounterId required"
    });
  }

  res.json({
    status: "accepted",
    encounterId,
    symptoms
  });

});

app.post("/clinical/notes", async (req: Request, res: Response) => {

  const { encounterId, notes } = req.body;

  if (!encounterId) {
    return res.status(400).json({
      error: "encounterId required"
    });
  }

  res.json({
    status: "accepted",
    encounterId,
    notes
  });

});

/*
================================================
AI TRIAGE
================================================
*/

app.post("/triage/nurse", async (req: Request, res: Response) => {

  try {

    await nurseTriageHandler(req, res);

  } catch (err) {

    console.error("Unhandled handler error:", err);

    res.status(500).json({
      error: "Unhandled server error"
    });

  }

});

/*
================================================
PRESCRIPTION
================================================
*/

app.post("/prescribe", prescriptionHandler);

/*
================================================
SERVER START
================================================
*/

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 GJHealth AI Orchestrator running on port ${PORT}`);
});

/*
================================================
AUTO HEARTBEAT LOOP
================================================
*/

setInterval(() => {
  sendHeartbeat();
}, 30000);
