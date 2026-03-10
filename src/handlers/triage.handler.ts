import { Request, Response } from "express";

import { orchestrateAI } from "../orchestration/ai.orchestrator.js";
import { AIMode } from "../orchestration/ai.modes.js";

import {
  getEncounterTimeline,
  storeAITriage
} from "../adapters/caseService.adapter.js";

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
    LOAD FULL CLINICAL CONTEXT
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

    const prompt = `
You are a clinical triage assistant.

Patient:
Name: ${patient?.name || "unknown"}
Gender: ${patient?.gender || "unknown"}

Vitals:
${JSON.stringify(latestVitals, null, 2)}

Symptoms:
${JSON.stringify(symptoms, null, 2)}

Nurse Notes:
${JSON.stringify(notes, null, 2)}

Task:
Provide a triage recommendation.
Classify risk level: LOW, MEDIUM, HIGH.
Explain reasoning.
`;

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
    STORE TRIAGE EVENT
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
