import express from "express";
import "dotenv/config";
import { syncOfflineQueue } from "./offline/offlineSync.js";
import { nurseTriageHandler } from "./handlers/triage.handler.js";
import { prescriptionHandler } from "./handlers/prescription.handler.js";
import { createPatient, createEncounter, storeVitals, storeSymptoms, storeNotes, storeTreatmentDecision } from "./adapters/caseService.adapter.js";
import { sendHeartbeat } from "./offline/heartbeatSender.js";
const app = express();
const PORT = Number(process.env.PORT) || 8087;
/*
================================================
MIDDLEWARE
================================================
*/
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());
/*
================================================
HEALTH CHECK
================================================
*/
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "gjh-ai-orchestrator",
        region: process.env.GCP_REGION || "europe-west1",
        timestamp: new Date().toISOString()
    });
});
/*
================================================
CLINICAL INTAKE
================================================
*/
app.post("/clinical/intake", async (req, res) => {
    try {
        console.log("---- INTAKE REQUEST RECEIVED ----");
        const { omang } = req.body;
        console.log("Request Body:", req.body);
        if (!omang) {
            return res.status(400).json({ error: "omang required" });
        }
        console.log("OMANG validated:", omang);
        /*
            ================================================
                CREATE PATIENT
                    ================================================
                        */
        console.log("Calling Case MCP → createPatient");
        const patient = await createPatient({
            name: omang,
            identifier: omang
        });
        console.log("Patient creation result:", patient);
        const patientId = patient.id;
        if (!patientId) {
            console.error("Patient ID missing from MCP response");
            throw new Error("Patient creation failed");
        }
        /*
            ================================================
                CREATE ENCOUNTER
                    ================================================
                        */
        console.log("Calling Case MCP → createEncounter");
        const encounter = await createEncounter(patientId);
        console.log("Encounter creation result:", encounter);
        const encounterId = encounter.id;
        if (!encounterId) {
            console.error("Encounter ID missing from MCP response");
            throw new Error("Encounter creation failed");
        }
        console.log("---- INTAKE SUCCESS ----");
        res.json({
            patientId,
            encounterId
        });
    }
    catch (err) {
        console.error("INTAKE ERROR");
        console.error(err);
        res.status(500).json({
            error: "Patient intake failed"
        });
    }
});
/*
================================================
STORE VITALS
================================================
*/
app.post("/clinical/vitals", async (req, res) => {
    try {
        const { encounterId, vitals } = req.body;
        if (!encounterId) {
            return res.status(400).json({ error: "encounterId required" });
        }
        const result = await storeVitals(encounterId, vitals);
        res.json(result);
    }
    catch (err) {
        console.error("Vitals error:", err);
        res.status(500).json({
            error: "Failed to store vitals"
        });
    }
});
/*
================================================
STORE SYMPTOMS
================================================
*/
app.post("/clinical/symptoms", async (req, res) => {
    try {
        const { encounterId, symptoms } = req.body;
        if (!encounterId) {
            return res.status(400).json({ error: "encounterId required" });
        }
        const result = await storeSymptoms(encounterId, symptoms);
        res.json(result);
    }
    catch (err) {
        console.error("Symptoms error:", err);
        res.status(500).json({
            error: "Failed to store symptoms"
        });
    }
});
/*
================================================
STORE NURSE NOTES
================================================
*/
app.post("/clinical/notes", async (req, res) => {
    try {
        const { encounterId, notes } = req.body;
        if (!encounterId) {
            return res.status(400).json({ error: "encounterId required" });
        }
        const result = await storeNotes(encounterId, notes);
        res.json(result);
    }
    catch (err) {
        console.error("Notes error:", err);
        res.status(500).json({
            error: "Failed to store notes"
        });
    }
});
/*
================================================
AI TRIAGE
================================================
*/
app.post("/triage/nurse", async (req, res) => {
    try {
        await nurseTriageHandler(req, res);
    }
    catch (err) {
        console.error("Unhandled handler error:", err);
        res.status(500).json({
            error: "Unhandled server error"
        });
    }
});
/*
================================================
TREATMENT DECISION
================================================
*/
app.post("/clinical/treatment-decision", async (req, res) => {
    try {
        const { encounterId, decision } = req.body;
        if (!encounterId) {
            return res.status(400).json({
                error: "encounterId required"
            });
        }
        const result = await storeTreatmentDecision(encounterId, decision);
        res.json(result);
    }
    catch (err) {
        console.error("Treatment decision error:", err);
        res.status(500).json({
            error: "Failed to store treatment decision"
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
    syncOfflineQueue();
}, 30000);
