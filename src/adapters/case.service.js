const CASE_API = process.env.CASE_API || "http://localhost:5050";

export async function recordVitals(encounterId, vitals) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/vitals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vitals)
  });

  return res.json();

}
