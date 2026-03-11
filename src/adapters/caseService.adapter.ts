const CASE_API = process.env.CASE_API || "http://localhost:5050";

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
                                throw new Error("Failed to create patient");
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

                                                                                                                      export async function storeSymptoms(encounterId: string, symptoms: any) {

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
                                                                                                                                                                                                        FETCH ENCOUNTER TIMELINE
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
                                                                                                                                                                                                                                                    throw new Error("Failed to store AI triage");
                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                        return res.json();
                                                                                                                                                                                                                                                        }