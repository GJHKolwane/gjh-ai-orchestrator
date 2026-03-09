import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";
import { evaluateOfflineStock } from "../offline/offlineStock.js";
import { isRegionalOnline } from "../offline/connectivityProbe.js";

/**
 * ======================================================
  * PRESCRIPTION HANDLER
   * ======================================================
    * Responsibility:
     * - Accept clinician prescription
      * - Check regional connectivity
       * - Use ONLINE mode if reachable
        * - Fallback to OFFLINE_AUTONOMOUS if not
         */

         export async function prescriptionHandler(req: any, res: any) {

           const {
               consultationId,
                   facilityId,
                       medication,
                           quantity,
                               prescriberId
                                 } = req.body;

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

                                                                         /*
                                                                           =====================================================
                                                                             CHECK REGIONAL CONNECTIVITY
                                                                               =====================================================
                                                                                 */

                                                                                   const regionalOnline = await isRegionalOnline(gatewayUrl);

                                                                                     if (!regionalOnline) {

                                                                                         console.warn("Regional unreachable — switching to OFFLINE mode");

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

                                                                                                                                                       /*
                                                                                                                                                         =====================================================
                                                                                                                                                           ONLINE MODE
                                                                                                                                                             =====================================================
                                                                                                                                                               */

                                                                                                                                                                 try {

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
                                                                                                                                                                                                                                                                                                     timeout: 5000
                                                                                                                                                                                                                                                                                                           }
                                                                                                                                                                                                                                                                                                               );

                                                                                                                                                                                                                                                                                                                   return res.status(200).json({
                                                                                                                                                                                                                                                                                                                         mode: "ONLINE",
                                                                                                                                                                                                                                                                                                                               status: "allocation_requested",
                                                                                                                                                                                                                                                                                                                                     regionalDecision: response.data
                                                                                                                                                                                                                                                                                                                                         });

                                                                                                                                                                                                                                                                                                                                           } catch (err) {

                                                                                                                                                                                                                                                                                                                                               console.warn("Regional call failed — fallback to OFFLINE mode");

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