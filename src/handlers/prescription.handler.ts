import axios from "axios";
import { getIdToken } from "../utils/googleAuth";

/**
 * Prescription Handler
 *
 * Responsibility:
 * - Accept clinician prescription
 * - Forward allocation request to API Gateway
 * - Return regional decision
 */

export async function prescriptionHandler(req: any, res: any) {
  try {
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
      throw new Error("API_GATEWAY_URL not configured");
    }

    // 🔐 Generate IAM token for Cloud Run call
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
        timeout: 10000
      }
    );

    return res.status(200).json({
      status: "allocation_requested",
      regionalDecision: response.data
    });

  } catch (err: any) {
    console.error("Prescription handler error:", err.message);

    return res.status(500).json({
      error: "Failed to process prescription"
    });
  }
      }
