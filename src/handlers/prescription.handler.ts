import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";
import { evaluateOfflineStock } from "../offline/offlineStock.js";

/**
 * Prescription Handler
 *
 * Responsibility:
 * - Accept clinician prescription
 * - Attempt regional allocation (ONLINE mode)
 * - Fallback to offline evaluation if timeout/network failure
 */

export async function prescriptionHandler(req: any, res: any) {
  const {
    consultationId,
    facilityId,
    medication,
    quantity,
    prescriberId
  } = req.body;

  // Basic validation
  if (!consultationId || !facilityId || !medication || !quantity) {
    return res.status(400).json({
      error: "consultationId, facilityId, medication, and quantity are required"
    });
  }

  const gatewayUrl = process.env.API_GATEWAY_URL;

  if (!gatewayUrl) {
    return res.status(500).json({
      error: "API_GATEWAY_URL not configured"
    });
  }

  try {
    /**
     * ==========================================
     * 🌍 ONLINE MODE (Primary Path)
     * ==========================================
     */

    const token = await getIdToken(gatewayUrl);

    const response = await axios.post(
      `${gatewayUrl}/medicine`,
      {
        signalId: consultationId,
        facilityId,
        medication,
        quantity,
        prescriberId,
        kpi: "PATIENT_MEDICATION_REQUEST",
        severity: "MEDIUM"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 2000 // ⏱ 2 second timeout for resilience
      }
    );

    return res.status(200).json({
      mode: "ONLINE",
      status: "allocation_requested",
      regionalDecision: response.data
    });

  } catch (err: any) {
    /**
     * ==========================================
     * 🏥 OFFLINE AUTONOMOUS MODE (Fallback)
     * ==========================================
     */

    console.warn("Regional unavailable — switching to OFFLINE mode");

    const offlineDecision = evaluateOfflineStock(
      medication,
      facilityId,
      quantity
    );

    return res.status(200).json({
      mode: "OFFLINE_AUTONOMOUS",
      status: "local_allocation_decision",
      requiresRegionalSync: true,
      offlineDecision
    });
  }
}
