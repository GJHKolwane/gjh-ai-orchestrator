import { orchestrateAI } from "../orchestrator/ai.orchestrator.js";
import { AIMode } from "../orchestrator/ai.modes.js";
import { getEncounterTimeline, storeAITriage } from "../adapters/caseService.adapter.js";
import { buildClinicalPrompt } from "../clinical/promptBuilder.js";
import { runOfflineTriage } from "../clinical/offlineTriageEngine.js";
/*
================================================
AI TRIAGE HANDLER
================================================
Runs AI triage and falls back to offline rules
when AI services are unreachable.
*/
export async function nurseTriageHandler(req, res) {
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
        const timeline = await getEncounterTimeline(encounterId);
        const { patient, timeline: events } = timeline;
        const latestVitals = events.vitals?.slice(-1)[0] || {};
        const symptoms = events.symptoms || [];
        const notes = events.notes || [];
        /*
        ==========================================
        BUILD AI PROMPT
        ==========================================
        */
        const prompt = buildClinicalPrompt(patient, latestVitals, symptoms, notes);
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
            }
            catch (parseErr) {
                console.warn("AI returned invalid JSON, falling back to offline triage");
                parsed = runOfflineTriage(patient, latestVitals, symptoms);
            }
            parsed.source = aiResult.source;
        }
        catch (aiError) {
            /*
            ==========================================
            OFFLINE FALLBACK
            ==========================================
            */
            console.warn("AI unreachable — switching to offline triage");
            parsed = runOfflineTriage(patient, latestVitals, symptoms);
        }
        /*
        ==========================================
        STORE TRIAGE RESULT
        ==========================================
        */
        await storeAITriage(encounterId, {
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
    }
    catch (err) {
        console.error("Triage system failure:", err);
        res.status(500).json({
            error: "Triage system unavailable"
        });
    }
}
