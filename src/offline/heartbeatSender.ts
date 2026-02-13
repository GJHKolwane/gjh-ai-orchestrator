import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";

export async function sendHeartbeat() {
  const gatewayUrl = process.env.API_GATEWAY_URL;
  const facilityId = process.env.FACILITY_ID;

  if (!gatewayUrl || !facilityId) {
    return;
  }

  try {
    const token = await getIdToken(gatewayUrl);

    await axios.post(
      `${gatewayUrl}/heartbeat`,
      { facilityId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 2000
      }
    );

    console.log("Heartbeat sent successfully");

  } catch (err) {
    console.warn("Heartbeat failed — facility likely offline");
  }
}
