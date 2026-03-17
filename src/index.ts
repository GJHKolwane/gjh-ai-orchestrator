import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { syncOfflineQueue } from "./offline/offlineSync.js";

import { nurseTriageHandler } from "./handlers/triage.handler.js";
import { prescriptionHandler } from "./handlers/prescription.handler.js";
import { prescriptionEvaluationHandler } from "./handlers/prescriptionEvaluation.handler.js";
import { prescriptionConfirmHandler } from "./handlers/prescriptionConfirm.handler.js";

import {
  createPatient,
    createEncounter,
      storeVitals,
        storeSymptoms,
          storeNotes,
            storeTreatmentDecision,
              setEncounterStage
              } from "./adapters/caseService.adapter.js";

              import { sendHeartbeat } from "./offline/heartbeatSender.js";

              const app = express();
              const PORT = Number(process.env.PORT) || 8087;

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
                                  CLINICAL INTAKE
                                  ================================================
                                  */

                                  app.post("/clinical/intake", async (req: Request, res: Response) => {

                                    try {

                                        const { omang } = req.body;

                                            if (!omang) {
                                                  return res.status(400).json({ error: "omang required" });
                                                      }

                                                          const patient = await createPatient({
                                                                identifier: omang,
                                                                      fullName: omang
                                                                          });

                                                                              // 🔥 CRITICAL GUARD
                                                                                  if (!patient?.id) {
                                                                                        throw new Error("Patient creation failed (no ID returned)");
                                                                                            }

                                                                                                const encounter = await createEncounter(patient.id);

                                                                                                    if (!encounter?.id) {
                                                                                                          throw new Error("Encounter creation failed (no ID returned)");
                                                                                                              }

                                                                                                                  await setEncounterStage(encounter.id, "intake");

                                                                                                                      res.json({
                                                                                                                            patientId: patient.id,
                                                                                                                                  encounterId: encounter.id
                                                                                                                                      });

                                                                                                                                        } catch (err) {

                                                                                                                                            console.error("INTAKE ERROR:", err);

                                                                                                                                                res.status(500).json({
                                                                                                                                                      error: "Patient intake failed",
                                                                                                                                                            details: (err as Error).message
                                                                                                                                                                });

                                                                                                                                                                  }

                                                                                                                                                                  });

                                                                                                                                                                  /*
                                                                                                                                                                  ================================================
                                                                                                                                                                  VITALS
                                                                                                                                                                  ================================================
                                                                                                                                                                  */

                                                                                                                                                                  app.post("/clinical/vitals", async (req: Request, res: Response) => {

                                                                                                                                                                    try {

                                                                                                                                                                        const { encounterId, vitals } = req.body;

                                                                                                                                                                            if (!encounterId || !vitals) {
                                                                                                                                                                                  return res.status(400).json({
                                                                                                                                                                                          error: "encounterId and vitals required"
                                                                                                                                                                                                });
                                                                                                                                                                                                    }

                                                                                                                                                                                                        const result = await storeVitals(encounterId, vitals);

                                                                                                                                                                                                            await setEncounterStage(encounterId, "triage");

                                                                                                                                                                                                                res.json(result);

                                                                                                                                                                                                                  } catch (err) {

                                                                                                                                                                                                                      res.status(500).json({ error: "Failed to store vitals" });

                                                                                                                                                                                                                        }

                                                                                                                                                                                                                        });

                                                                                                                                                                                                                        /*
                                                                                                                                                                                                                        ================================================
                                                                                                                                                                                                                        SYMPTOMS
                                                                                                                                                                                                                        ================================================
                                                                                                                                                                                                                        */

                                                                                                                                                                                                                        app.post("/clinical/symptoms", async (req: Request, res: Response) => {

                                                                                                                                                                                                                          try {

                                                                                                                                                                                                                              const { encounterId, symptoms } = req.body;

                                                                                                                                                                                                                                  if (!encounterId) {
                                                                                                                                                                                                                                        return res.status(400).json({ error: "encounterId required" });
                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                const result = await storeSymptoms(encounterId, symptoms);

                                                                                                                                                                                                                                                    res.json(result);

                                                                                                                                                                                                                                                      } catch {

                                                                                                                                                                                                                                                          res.status(500).json({ error: "Failed to store symptoms" });

                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                            /*
                                                                                                                                                                                                                                                            ================================================
                                                                                                                                                                                                                                                            NOTES
                                                                                                                                                                                                                                                            ================================================
                                                                                                                                                                                                                                                            */

                                                                                                                                                                                                                                                            app.post("/clinical/notes", async (req: Request, res: Response) => {

                                                                                                                                                                                                                                                              try {

                                                                                                                                                                                                                                                                  const { encounterId, notes } = req.body;

                                                                                                                                                                                                                                                                      if (!encounterId) {
                                                                                                                                                                                                                                                                            return res.status(400).json({ error: "encounterId required" });
                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                    const result = await storeNotes(encounterId, notes);

                                                                                                                                                                                                                                                                                        res.json(result);

                                                                                                                                                                                                                                                                                          } catch {

                                                                                                                                                                                                                                                                                              res.status(500).json({ error: "Failed to store notes" });

                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                /*
                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                AI TRIAGE
                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                */

                                                                                                                                                                                                                                                                                                app.post("/triage/nurse", nurseTriageHandler);

                                                                                                                                                                                                                                                                                                /*
                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                TREATMENT DECISION
                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                */

                                                                                                                                                                                                                                                                                                app.post("/clinical/treatment-decision", async (req: Request, res: Response) => {

                                                                                                                                                                                                                                                                                                  const { encounterId, decision } = req.body;

                                                                                                                                                                                                                                                                                                    if (!encounterId) {
                                                                                                                                                                                                                                                                                                        return res.status(400).json({ error: "encounterId required" });
                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                            const result = await storeTreatmentDecision(encounterId, decision);

                                                                                                                                                                                                                                                                                                              await setEncounterStage(encounterId, "treatment");

                                                                                                                                                                                                                                                                                                                res.json(result);

                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                /*
                                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                                PRESCRIPTION EVALUATION
                                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                                */

                                                                                                                                                                                                                                                                                                                app.post("/clinical/prescription/evaluate", prescriptionEvaluationHandler);

                                                                                                                                                                                                                                                                                                                /*
                                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                                PRESCRIPTION CONFIRM
                                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                                */

                                                                                                                                                                                                                                                                                                                app.post("/clinical/prescription/confirm", prescriptionConfirmHandler);

                                                                                                                                                                                                                                                                                                                /*
                                                                                                                                                                                                                                                                                                                ================================================
                                                                                                                                                                                                                                                                                                                LEGACY PRESCRIPTION
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
                                                                                                                                                                                                                                                                                                                  BACKGROUND TASKS
                                                                                                                                                                                                                                                                                                                  ================================================
                                                                                                                                                                                                                                                                                                                  */

                                                                                                                                                                                                                                                                                                                  setInterval(() => {
                                                                                                                                                                                                                                                                                                                    sendHeartbeat();
                                                                                                                                                                                                                                                                                                                      syncOfflineQueue();
                                                                                                                                                                                                                                                                                                                      }, 30000);