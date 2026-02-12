import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth();

export async function getIdToken(targetAudience: string): Promise<string> {
  if (!targetAudience) {
    throw new Error("Target audience is required for ID token generation");
  }

  const client = await auth.getIdTokenClient(targetAudience);
  const token = await client.idTokenProvider.fetchIdToken(targetAudience);

  return token;
}
