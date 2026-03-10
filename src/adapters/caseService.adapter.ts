const CASE_API = process.env.CASE_API || "http://localhost:5050";

/*
=========================================
FETCH FULL CLINICAL TIMELINE
=========================================
*/

export async function getEncounterTimeline(encounterId: string) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/timeline`);

  if (!res.ok) {
    throw new Error("Failed to load encounter timeline");
  }

  return res.json();

}

/*
=========================================
STORE AI TRIAGE EVENT
=========================================
*/

export async function storeAITriage(encounterId: string, triage: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(triage)
  });

  if (!res.ok) {
    throw new Error("Failed to store AI triage");
  }

  return res.json();

}
