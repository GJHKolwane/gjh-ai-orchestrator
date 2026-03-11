import { Request, Response } from "express";

import { orchestrateAI } from "../orchestration/ai.orchestrator.js";
import { AIMode } from "../orchestration/ai.modes.js";

import {
  getEncounterTimeline,
  storeAITriage
} from "../adapters/caseService.adapter.js";

import { buildClinicalTriagePrompt } from "../clinical/promptBuilder.js";

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

    const latestVitals = events.vitals?.slice(-1)[0] || null;
    const symptoms = events.symptoms || [];
    const notes = events.notes || [];

    /*
    ==========================================
    BUILD AI PROMPT
    ==========================================
    */

    const prompt = buildClinicalTriagePrompt(
      patient,
      latestVitals,
      symptoms,
      notes
    );

    /*
    ==========================================
    RUN AI TRIAGE
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
    STORE TRIAGE EVENT IN CASE SERVICE
    ==========================================
    */

    await storeAITriage(encounterId, {
      model: aiResult.source,
      recommendation: aiResult.output,
      createdAt: new Date().toISOString()
    });

    /*
    ==========================================
    RETURN RESULT TO DASHBOARD
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
