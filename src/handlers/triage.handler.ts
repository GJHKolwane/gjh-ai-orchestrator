import { Request, Response } from "express";

import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";

import {
  getEncounterTimeline,
  storeAITriage
} from "../adapters/caseService.adapter.js";

import { buildClinicalPrompt } from "../clinical/promptBuilder.js";
import { runOfflineTriage } from "../clinical/offlineTriageEngine.js";

import { runClinicalSafetyChecks } from "../clinical/clinicalSafety.engine.js";

/*
================================================
AI TRIAGE HANDLER
================================================
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
    LOAD TIMELINE
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

    const vitalsEvents = events.vitals || [];
    const symptomsEvents = events.symptoms || [];
    const notesEvents = events.notes || [];
    const doctorNotesEvents = events.doctorNotes || [];

    const latestVitalsEvent =
      vitalsEvents.length > 0 ? vitalsEvents[vitalsEvents.length - 1] : null;

    const latestVitals = latestVitalsEvent?.data || {};

    const symptoms = symptomsEvents.map((e: any) => e.data || e);
    const notes = notesEvents.map((e: any) => e.data || e);
    const doctorNotes = doctorNotesEvents.map((e: any) => e.data || e);

    /*
    ==========================================
    CLINICAL SAFETY LAYER
    ==========================================
    */

    const safety = runClinicalSafetyChecks(
      patient,
      latestVitals,
      symptoms
    );

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

    const safetySection =
      safety.alerts.length > 0
        ? "\nSAFETY ALERTS:\n" +
          safety.alerts.map(a => `- ${a.message}`).join("\n")
        : "";

    const finalPrompt = prompt + safetySection;

    let parsed;

    try {

      const aiResult = await orchestrateAI({
        consultationId: encounterId,
        actor: "AI_TRIAGE",
        mode: AIMode.CLINICAL,
        prompt: finalPrompt
      });

      try {

        parsed = JSON.parse(aiResult.output);

      } catch {

        console.warn("AI JSON parse failed — using offline triage");

        parsed = runOfflineTriage(patient, latestVitals, symptoms);

      }

      parsed.source = aiResult.source;

    } catch {

      console.warn("AI unavailable — offline triage");

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
      safetyAlerts: safety.alerts,
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
      safetyAlerts: safety.alerts,
      triage: parsed
    });

  } catch (err) {

    console.error("Triage system failure:", err);

    res.status(500).json({
      error: "Triage system unavailable"
    });

  }

}
