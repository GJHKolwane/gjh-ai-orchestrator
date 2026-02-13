import axios from "axios";
import { getIdToken } from "../utils/googleAuth.js";

export async function isRegionalOnline(
  gatewayUrl: string
): Promise<boolean> {
  try {
    const token = await getIdToken(gatewayUrl);

    const response = await axios.get(
      `${gatewayUrl}/health`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 1000 // fast check
      }
    );

    return response.status === 200;
  } catch {
    return false;
  }
}
