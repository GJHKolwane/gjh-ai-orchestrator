import express, { Request, Response } from "express";
import cors from "cors";

import { nurseTriageHandler } from "./handlers/triage.handler.js";
import { prescriptionHandler } from "./handlers/prescription.handler.js";

import {
  createPatient,
    createEncounter,
      storeVitals,
        storeSymptoms,
          storeNotes
          } from "./adapters/caseService.adapter.js";

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
                                                            name: omang,
                                                                  identifier: omang
                                                                      });

                                                                          const encounter = await createEncounter(patient.id);

                                                                              res.json({
                                                                                    patientId: patient.id,
                                                                                          encounterId: encounter.id
                                                                                              });

                                                                                                } catch (err) {

                                                                                                    console.error("Intake error:", err);

                                                                                                        res.status(500).json({
                                                                                                              error: "Clinical intake failed"
                                                                                                                  });

                                                                                                                    }

                                                                                                                    });

                                                                                                                    /*
                                                                                                                    ================================================
                                                                                                                    STORE VITALS
                                                                                                                    ================================================
                                                                                                                    */

                                                                                                                    app.post("/clinical/vitals", async (req: Request, res: Response) => {

                                                                                                                      try {

                                                                                                                          const { encounterId, vitals } = req.body;

                                                                                                                              if (!encounterId) {
                                                                                                                                    return res.status(400).json({ error: "encounterId required" });
                                                                                                                                        }

                                                                                                                                            const result = await storeVitals(encounterId, vitals);

                                                                                                                                                res.json(result);

                                                                                                                                                  } catch (err) {

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

                                                                                                                                                                      app.post("/clinical/symptoms", async (req: Request, res: Response) => {

                                                                                                                                                                        try {

                                                                                                                                                                            const { encounterId, symptoms } = req.body;

                                                                                                                                                                                if (!encounterId) {
                                                                                                                                                                                      return res.status(400).json({ error: "encounterId required" });
                                                                                                                                                                                          }

                                                                                                                                                                                              const result = await storeSymptoms(encounterId, symptoms);

                                                                                                                                                                                                  res.json(result);

                                                                                                                                                                                                    } catch (err) {

                                                                                                                                                                                                        console.error("Symptoms error:", err);

                                                                                                                                                                                                            res.status(500).json({
                                                                                                                                                                                                                  error: "Failed to store symptoms"
                                                                                                                                                                                                                      });

                                                                                                                                                                                                                        }

                                                                                                                                                                                                                        });

                                                                                                                                                                                                                        /*
                                                                                                                                                                                                                        ================================================
                                                                                                                                                                                                                        STORE NOTES
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

                                                                                                                                                                                                                                                      } catch (err) {

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