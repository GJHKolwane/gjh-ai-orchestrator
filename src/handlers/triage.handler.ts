import { Request, Response } from "express";

import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";

import {
  getEncounterTimeline,
  storeAITriage
} from "../adapters/caseService.adapter.js";

import { buildClinicalPrompt } from "../clinical/promptBuilder.js";
import { runOfflineTriage } from "../clinical/offlineTriageEngine.js";

/*
================================================
AI TRIAGE HANDLER
================================================
Runs AI triage and falls back to offline rules
when AI services are unreachable.
*/

export async function nurseTriageHandler(req: Request, res: Response) {

  const { encounterId } = req.body;

  if (!encounterId) {
    return res.status(400).json({
      error: "encounterId required"
    });
  }

  try {

    /*
    ==========================================
    LOAD CLINICAL TIMELINE
    ==========================================
    */

    const timelineResponse = await getEncounterTimeline(encounterId);

    if (!timelineResponse) {
      return res.status(404).json({
        error: "Encounter timeline not found"
      });
    }

    const patient = timelineResponse.patient;
    const events = timelineResponse.timeline || {};

    /*
    ==========================================
    EXTRACT CLINICAL DATA
    ==========================================
    */

    const vitalsEvents = events.vitals || [];
    const symptomsEvents = events.symptoms || [];
    const notesEvents = events.notes || [];
    const doctorNotesEvents = events.doctorNotes || [];

    const latestVitalsEvent = vitalsEvents.length
      ? vitalsEvents[vitalsEvents.length - 1]
      : null;

    const latestVitals = latestVitalsEvent?.data || {};

    const symptoms = symptomsEvents.map((e: any) => e.data || e);
    const notes = notesEvents.map((e: any) => e.data || e);
    const doctorNotes = doctorNotesEvents.map((e: any) => e.data || e);

    /*
    ==========================================
    VALIDATE DATA FOR TRIAGE
    ==========================================
    */

    if (!latestVitals && symptoms.length === 0) {

      return res.status(400).json({
        error: "No clinical data available for triage"
      });

    }

    /*
    ==========================================
    BUILD AI PROMPT
    ==========================================
    */

    const prompt = buildClinicalPrompt(
      patient,
      latestVitals,
      symptoms,
      [...notes, ...doctorNotes]
    );

    let parsed;

    try {

      /*
      ==========================================
      RUN CLOUD AI
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
      PARSE AI OUTPUT SAFELY
      ==========================================
      */

      try {

        parsed = JSON.parse(aiResult.output);

      } catch (parseErr) {

        console.warn("AI returned invalid JSON — switching to offline triage");

        parsed = runOfflineTriage(patient, latestVitals, symptoms);

      }

      parsed.source = aiResult.source;

    } catch (aiError) {

      /*
      ==========================================
      OFFLINE FALLBACK
      ==========================================
      */

      console.warn("AI unreachable — switching to offline triage");

      parsed = runOfflineTriage(patient, latestVitals, symptoms);

      parsed.source = "OFFLINE_RULE_ENGINE";

    }

    /*
    ==========================================
    STORE TRIAGE RESULT
    ==========================================
    */

    await storeAITriage(encounterId, {
      actor: "AI_TRIAGE",
      model: parsed.source || "OFFLINE_RULE_ENGINE",
      riskLevel: parsed.riskLevel,
      observations: parsed.observations,
      considerations: parsed.considerations,
      reasoning: parsed.reasoning || "",
      aiSuggestion: parsed.aiSuggestion || null,
      createdAt: new Date().toISOString()
    });

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    res.json({
      encounterId,
      triage: parsed
    });

  } catch (err) {

    console.error("Triage system failure:", err);

    res.status(500).json({
      error: "Triage system unavailable"
    });

  }

}
