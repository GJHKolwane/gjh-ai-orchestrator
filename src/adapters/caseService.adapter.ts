import { enqueueOfflineItem } from "../offline/offlineQueue";

const CASE_API =
  process.env.CASE_API ||
    "http://localhost:5050";

    /*
    ================================================
    SAFE REQUEST WRAPPER
    ================================================
    */

    async function safeRequest(endpoint: string, method: string, payload?: any) {

      try {

          const res = await fetch(`${CASE_API}${endpoint}`, {
                method,
                      headers: {
                              "Content-Type": "application/json"
                                    },
                                          body: payload ? JSON.stringify(payload) : undefined
                                              });

                                                  const text = await res.text();

                                                      let data: any = {};
                                                          try {
                                                                data = text ? JSON.parse(text) : {};
                                                                    } catch {
                                                                          data = {};
                                                                              }

                                                                                  if (!res.ok) {

                                                                                        console.warn("CASE service error:", endpoint, res.status);

                                                                                              enqueueOfflineItem({
                                                                                                      endpoint,
                                                                                                              method,
                                                                                                                      payload
                                                                                                                            });

                                                                                                                                  return { status: "stored_offline" };

                                                                                                                                      }

                                                                                                                                          return data;

                                                                                                                                            } catch (err) {

                                                                                                                                                console.warn("CASE unreachable:", endpoint);

                                                                                                                                                    enqueueOfflineItem({
                                                                                                                                                          endpoint,
                                                                                                                                                                method,
                                                                                                                                                                      payload
                                                                                                                                                                          });

                                                                                                                                                                              return { status: "stored_offline" };

                                                                                                                                                                                }

                                                                                                                                                                                }

                                                                                                                                                                                /*
                                                                                                                                                                                ================================================
                                                                                                                                                                                CREATE PATIENT
                                                                                                                                                                                ================================================
                                                                                                                                                                                */

                                                                                                                                                                                export async function createPatient(data: any) {
                                                                                                                                                                                  return safeRequest("/patients", "POST", data);
                                                                                                                                                                                  }

                                                                                                                                                                                  /*
                                                                                                                                                                                  ================================================
                                                                                                                                                                                  CREATE ENCOUNTER
                                                                                                                                                                                  ================================================
                                                                                                                                                                                  */

                                                                                                                                                                                  export async function createEncounter(patientId: string) {
                                                                                                                                                                                    return safeRequest("/encounters", "POST", { patientId });
                                                                                                                                                                                    }

                                                                                                                                                                                    /*
                                                                                                                                                                                    ================================================
                                                                                                                                                                                    SET ENCOUNTER STAGE
                                                                                                                                                                                    ================================================
                                                                                                                                                                                    */

                                                                                                                                                                                    export async function setEncounterStage(encounterId: string, stage: string) {
                                                                                                                                                                                      return safeRequest(`/encounters/${encounterId}/stage`, "POST", { stage });
                                                                                                                                                                                      }

                                                                                                                                                                                      /*
                                                                                                                                                                                      ================================================
                                                                                                                                                                                      STORE VITALS
                                                                                                                                                                                      ================================================
                                                                                                                                                                                      */

                                                                                                                                                                                      export async function storeVitals(encounterId: string, vitals: any) {
                                                                                                                                                                                        return safeRequest(`/encounters/${encounterId}/vitals`, "POST", vitals);
                                                                                                                                                                                        }

                                                                                                                                                                                        /*
                                                                                                                                                                                        ================================================
                                                                                                                                                                                        STORE SYMPTOMS
                                                                                                                                                                                        ================================================
                                                                                                                                                                                        */

                                                                                                                                                                                        export async function storeSymptoms(encounterId: string, symptoms: any) {
                                                                                                                                                                                          return safeRequest(`/encounters/${encounterId}/symptoms`, "POST", symptoms);
                                                                                                                                                                                          }

                                                                                                                                                                                          /*
                                                                                                                                                                                          ================================================
                                                                                                                                                                                          STORE NOTES
                                                                                                                                                                                          ================================================
                                                                                                                                                                                          */

                                                                                                                                                                                          export async function storeNotes(encounterId: string, notes: any) {
                                                                                                                                                                                            return safeRequest(`/encounters/${encounterId}/notes`, "POST", { notes });
                                                                                                                                                                                            }

                                                                                                                                                                                            /*
                                                                                                                                                                                            ================================================
                                                                                                                                                                                            STORE DOCTOR NOTES
                                                                                                                                                                                            ================================================
                                                                                                                                                                                            */

                                                                                                                                                                                            export async function storeDoctorNotes(encounterId: string, notes: any) {
                                                                                                                                                                                              return safeRequest(`/encounters/${encounterId}/doctor-notes`, "POST", notes);
                                                                                                                                                                                              }

                                                                                                                                                                                              /*
                                                                                                                                                                                              ================================================
                                                                                                                                                                                              TIMELINE
                                                                                                                                                                                              ================================================
                                                                                                                                                                                              */

                                                                                                                                                                                              export async function getEncounterTimeline(encounterId: string) {

                                                                                                                                                                                                const res = await fetch(`${CASE_API}/encounters/${encounterId}/timeline`);

                                                                                                                                                                                                  if (!res.ok) {
                                                                                                                                                                                                      throw new Error("Timeline fetch failed");
                                                                                                                                                                                                        }

                                                                                                                                                                                                          return res.json();
                                                                                                                                                                                                          }

                                                                                                                                                                                                          /*
                                                                                                                                                                                                          ================================================
                                                                                                                                                                                                          AI TRIAGE
                                                                                                                                                                                                          ================================================
                                                                                                                                                                                                          */

                                                                                                                                                                                                          export async function storeAITriage(encounterId: string, triage: any) {
                                                                                                                                                                                                            return safeRequest(`/encounters/${encounterId}/triage`, "POST", triage);
                                                                                                                                                                                                            }

                                                                                                                                                                                                            /*
                                                                                                                                                                                                            ================================================
                                                                                                                                                                                                            TREATMENT DECISION
                                                                                                                                                                                                            ================================================
                                                                                                                                                                                                            */

                                                                                                                                                                                                            export async function storeTreatmentDecision(
                                                                                                                                                                                                              encounterId: string,
                                                                                                                                                                                                                decision: any
                                                                                                                                                                                                                ) {
                                                                                                                                                                                                                  return safeRequest(
                                                                                                                                                                                                                      `/encounters/${encounterId}/treatment-decision`,
                                                                                                                                                                                                                          "POST",
                                                                                                                                                                                                                              decision
                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                }