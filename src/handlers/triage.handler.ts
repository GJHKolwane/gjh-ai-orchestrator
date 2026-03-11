import { Request, Response } from "express";

import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";

import {
  getEncounterTimeline,
    storeAITriage
    } from "../adapters/caseService.adapter.js";

    import { buildClinicalPrompt } from "../clinical/promptBuilder.js";

    /*
    ================================================
    AI TRIAGE HANDLER
    ================================================
    */

    export async function nurseTriageHandler(req: Request, res: Response) {

      try {

          const { encounterId } = req.body;

              if (!encounterId) {
                    return res.status(400).json({
                            error: "encounterId required"
                                  });
                                      }

                                          /*
                                              ==========================================
                                                  LOAD CLINICAL TIMELINE
                                                      ==========================================
                                                          */

                                                              const timeline = await getEncounterTimeline(encounterId);

                                                                  const { patient, timeline: events } = timeline;

                                                                      const latestVitals = events.vitals?.slice(-1)[0];
                                                                          const symptoms = events.symptoms || [];
                                                                              const notes = events.notes || [];

                                                                                  /*
                                                                                      ==========================================
                                                                                          BUILD AI PROMPT
                                                                                              ==========================================
                                                                                                  */

                                                                                                      const prompt = buildClinicalPrompt(
                                                                                                            patient,
                                                                                                                  latestVitals,
                                                                                                                        symptoms,
                                                                                                                              notes
                                                                                                                                  );

                                                                                                                                      /*
                                                                                                                                          ==========================================
                                                                                                                                              RUN AI
                                                                                                                                                  ==========================================
                                                                                                                                                      */

                                                                                                                                                          const aiResult = await orchestrateAI({
                                                                                                                                                                consultationId: encounterId,
                                                                                                                                                                      actor: "AI_TRIAGE",
                                                                                                                                                                            mode: AIMode.CLINICAL,
                                                                                                                                                                                  prompt
                                                                                                                                                                                      });

                                                                                                                                                                                          /*
                                                                                                                                                                                              ==========================================
                                                                                                                                                                                                  STORE AI TRIAGE
                                                                                                                                                                                                      ==========================================
                                                                                                                                                                                                          */

                                                                                                                                                                                                              await storeAITriage(encounterId, {
                                                                                                                                                                                                                    model: aiResult.source,
                                                                                                                                                                                                                          recommendation: aiResult.output,
                                                                                                                                                                                                                                createdAt: new Date().toISOString()
                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                        /*
                                                                                                                                                                                                                                            ==========================================
                                                                                                                                                                                                                                                RESPONSE
                                                                                                                                                                                                                                                    ==========================================
                                                                                                                                                                                                                                                        */

                                                                                                                                                                                                                                                            res.json({
                                                                                                                                                                                                                                                                  encounterId,
                                                                                                                                                                                                                                                                        triage: aiResult.output
                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                              } catch (err) {

                                                                                                                                                                                                                                                                                  console.error("Triage error:", err);

                                                                                                                                                                                                                                                                                      res.status(500).json({
                                                                                                                                                                                                                                                                                            error: "Triage failed"
                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                  }