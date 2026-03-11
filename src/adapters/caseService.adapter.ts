const CASE_API = process.env.CASE_API || "http://localhost:5050";

/*
================================================
PATIENT CREATION
================================================
*/

export async function createPatient(patient: any) {

  const res = await fetch(`${CASE_API}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(patient)
  });

  if (!res.ok) {
    throw new Error("Failed to create patient");
  }

  return res.json();

}

/*
================================================
ENCOUNTER CREATION
================================================
*/

export async function createEncounter(patientId: string) {

  const res = await fetch(`${CASE_API}/encounters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      patientId
    })
  });

  if (!res.ok) {
    throw new Error("Failed to create encounter");
  }

  return res.json();

}

/*
================================================
FETCH FULL CLINICAL TIMELINE
================================================
*/

export async function getEncounterTimeline(encounterId: string) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/timeline`);

  if (!res.ok) {
    throw new Error("Failed to load encounter timeline");
  }

  return res.json();

}

/*
================================================
STORE VITALS
================================================
*/

export async function storeVitals(encounterId: string, vitals: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/vitals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vitals)
  });

  if (!res.ok) {
    throw new Error("Failed to store vitals");
  }

  return res.json();

}

/*
================================================
STORE SYMPTOMS
================================================
*/

export async function storeSymptoms(encounterId: string, symptoms: any[]) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/symptoms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(symptoms)
  });

  if (!res.ok) {
    throw new Error("Failed to store symptoms");
  }

  return res.json();

}

/*
================================================
STORE NOTES
================================================
*/

export async function storeNotes(encounterId: string, notes: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      notes
    })
  });

  if (!res.ok) {
    throw new Error("Failed to store notes");
  }

  return res.json();

}

/*
================================================
STORE AI TRIAGE EVENT
================================================
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

/*
================================================
STORE SOAN
================================================
*/

export async function storeSOAN(encounterId: string, soan: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/soan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(soan)
  });

  if (!res.ok) {
    throw new Error("Failed to store SOAN");
  }

  return res.json();

}

/*
================================================
STORE PRESCRIPTION
================================================
*/

export async function storePrescription(encounterId: string, prescription: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/prescription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(prescription)
  });

  if (!res.ok) {
    throw new Error("Failed to store prescription");
  }

  return res.json();

                                 }
