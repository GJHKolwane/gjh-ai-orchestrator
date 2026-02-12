import { runNurseTriagePipeline } from "../pipelines/triage.pipeline.js";
/**
 * Nurse Triage HTTP Handler
 *
 * Responsibilities:
 * - Validate incoming request
 * - Call nurse triage pipeline
 * - Return structured governed response
 *
 * IMPORTANT:
 * - No AI logic here
 * - No governance logic here
 * - No provider logic here
 */
export async function nurseTriageHandler(req, res) {
    try {
        const body = req.body;
        if (!body) {
            return res.status(400).json({
                error: "Missing request body",
            });
        }
        const { consultationId, patient, nurse, context, } = body;
        // 🔒 Minimal input validation (pipeline enforces deeper governance)
        if (!consultationId || !patient || !nurse || !context) {
            return res.status(400).json({
                error: "consultationId, patient, nurse, and context are required",
            });
        }
        // 🧠 Execute governed nurse triage pipeline
        const result = await runNurseTriagePipeline({
            consultationId,
            patient,
            nurse,
            context,
        });
        // ✅ Success response
        return res.status(200).json({
            consultationId,
            triage: result,
        });
    }
    catch (err) {
        console.error("Nurse triage handler error:", err);
        return res.status(500).json({
            error: "Failed to execute nurse triage",
            message: err.message,
        });
    }
}
