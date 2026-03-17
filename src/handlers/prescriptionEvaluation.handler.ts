import { Request, Response } from "express";

/*
================================================
PRESCRIPTION EVALUATION HANDLER
Bridge: Clinical → Medicine Intelligence
================================================
*/

export async function prescriptionEvaluationHandler(req: Request, res: Response) {

  try {

    const {
      consultationId,
      facilityId,
      treatmentPlan,
      patientContext
    } = req.body;

    if (!consultationId || !facilityId || !treatmentPlan) {
      return res.status(400).json({
        error: "consultationId, facilityId and treatmentPlan required"
      });
    }

    /*
    ==========================================
    LOOP THROUGH MEDICATIONS
    ==========================================
    */

    const evaluations = [];

    for (const item of treatmentPlan) {

      const medication = item.medication;

      /*
      ==========================================
      CALL MEDICINE AVAILABILITY MCP
      (Simulated for now — replace with real calls)
      ==========================================
      */

      const availability = {
        status: "AVAILABLE",
        remaining: Math.floor(Math.random() * 100)
      };

      const alternatives = [
        {
          medication: medication + "_ALT_1",
          availableUnits: 50
        },
        {
          medication: medication + "_ALT_2",
          availableUnits: 30
        }
      ];

      const regionalOptions = [
        {
          facility: "FAC-002",
          stock: 120
        }
      ];

      const pressureLevel = availability.remaining < 20 ? "WARNING" : "NORMAL";

      /*
      ==========================================
      BUILD CORE SIGNAL (ALIGNED)
      ==========================================
      */

      const coreSignal = {
        signalId: `SIG-${Date.now()}`,
        kpi: "MEDICINE_AVAILABILITY",
        severity: pressureLevel === "WARNING" ? "MEDIUM" : "LOW",
        domain: "MEDICINE_AVAILABILITY",
        facilityId,
        medication: medication,
        medicationCategory: item.category,
        stockState: {
          medication,
          availableUnits: availability.remaining,
          thresholdPercent: 20
        },
        alternatives,
        redistributionCandidates: regionalOptions,
        medicineClass: item.medicineClass,
        essentialMedicine: item.essentialMedicine,
        timestamp: new Date().toISOString()
      };

      evaluations.push({
        medication,
        availability,
        alternatives,
        regionalOptions,
        pressureLevel,
        coreSignal
      });

    }

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    res.json({
      consultationId,
      facilityId,
      evaluations,
      governance: {
        clinicianDecisionRequired: true
      }
    });

  } catch (err) {

    console.error("Prescription evaluation error:", err);

    res.status(500).json({
      error: "Prescription evaluation failed"
    });

  }

        }
