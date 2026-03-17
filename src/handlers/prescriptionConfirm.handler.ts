import { Request, Response } from "express";
import { enqueueOfflineItem } from "../offline/offlineQueue.js";
import { setEncounterStage } from "../adapters/caseService.adapter.js";

/*
================================================
PRESCRIPTION CONFIRM HANDLER
Finalizes prescription → deducts stock → emits signals
================================================
*/

export async function prescriptionConfirmHandler(req: Request, res: Response) {

  try {

    const {
      encounterId,
      facilityId,
      treatmentPlan
    } = req.body;

    if (!encounterId || !facilityId || !treatmentPlan) {
      return res.status(400).json({
        error: "encounterId, facilityId and treatmentPlan required"
      });
    }

    const results = [];

    for (const item of treatmentPlan) {

      const medication = item.medication;

      /*
      ==========================================
      SIMULATED DEDUCTION (REPLACE WITH MCP CALL)
      ==========================================
      */

      let deductionResult;

      try {

        // 🔁 Replace with real:
        // await fetch("medicine-mcp/internal/deduct")

        deductionResult = {
          success: true,
          remainingStock: Math.floor(Math.random() * 100),
          reorderLevel: 20
        };

      } catch (err) {

        /*
        ==========================================
        OFFLINE FALLBACK
        ==========================================
        */

        enqueueOfflineItem({
          endpoint: "/internal/deduct",
          method: "POST",
          payload: item
        });

        deductionResult = {
          success: false,
          status: "stored_offline"
        };

      }

      /*
      ==========================================
      BUILD MEDICINE SIGNAL
      ==========================================
      */

      const medicineSignal = {
        signalId: `MSIG-${Date.now()}`,
        facilityId,
        medication,
        remainingStock: deductionResult.remainingStock || 0,
        reorderLevel: deductionResult.reorderLevel || 20,
        severity:
          deductionResult.remainingStock < 20
            ? "HIGH"
            : "LOW",
        timestamp: new Date().toISOString()
      };

      results.push({
        medication,
        deduction: deductionResult,
        medicineSignal
      });

    }

    /*
    ==========================================
    UPDATE ENCOUNTER STAGE
    ==========================================
    */

    await setEncounterStage(encounterId, "pharmacy_processing");

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    res.json({
      encounterId,
      status: "confirmed",
      results
    });

  } catch (err) {

    console.error("Prescription confirm error:", err);

    res.status(500).json({
      error: "Prescription confirmation failed"
    });

  }

             }
