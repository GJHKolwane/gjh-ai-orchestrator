/*
================================================
CASE SERVICE CONFIG
================================================
*/

const CASE_API =
  process.env.CASE_API ||
  "https://studious-eureka-97r6r77x6rqr2p4gv-5050.app.github.dev";

/*
================================================
CREATE PATIENT
================================================
*/

export async function createPatient(data: any) {

  const res = await fetch(`${CASE_API}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create patient: ${text}`);
  }

  return res.json();
}

/*
================================================
CREATE ENCOUNTER
================================================
*/

export async function createEncounter(patientId: string) {

  const res = await fetch(`${CASE_API}/encounters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ patientId })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create encounter: ${text}`);
  }

  return res.json();
}

/*
================================================
SET ENCOUNTER STAGE (NEW FIX)
================================================
*/

export async function setEncounterStage(encounterId: string, stage: string) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/stage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ stage })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to set encounter stage: ${text}`);
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
    const text = await res.text();
    throw new Error(`Failed to store vitals: ${text}`);
  }

  return res.json();
}

/*
================================================
STORE SYMPTOMS
================================================
*/

export async function storeSymptoms(encounterId: string, symptoms: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/symptoms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(symptoms)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to store symptoms: ${text}`);
  }

  return res.json();
}

/*
================================================
STORE NURSE NOTES
================================================
*/

export async function storeNotes(encounterId: string, notes: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ notes })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to store notes: ${text}`);
  }

  return res.json();
}

/*
================================================
STORE DOCTOR NOTES
================================================
*/

export async function storeDoctorNotes(encounterId: string, notes: any) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/doctor-notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(notes)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to store doctor notes: ${text}`);
  }

  return res.json();
}

/*
================================================
FETCH TIMELINE
================================================
*/

export async function getEncounterTimeline(encounterId: string) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/timeline`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load encounter timeline: ${text}`);
  }

  return res.json();
}

/*
================================================
STORE AI TRIAGE
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
    const text = await res.text();
    throw new Error(`Failed to store AI triage: ${text}`);
  }

  return res.json();
}

/*
================================================
STORE TREATMENT DECISION
================================================
*/

export async function storeTreatmentDecision(
  encounterId: string,
  decision: any
) {

  const res = await fetch(`${CASE_API}/encounters/${encounterId}/treatment-decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(decision)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to store treatment decision: ${text}`);
  }

  return res.json();
}
