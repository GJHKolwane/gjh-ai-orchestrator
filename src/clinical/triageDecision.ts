/*
====================================================
TRIAGE DECISION ENGINE
====================================================

Purpose:
Interpret AI triage output and convert it into a
workflow decision that the dashboard and orchestrator
can act on.

This keeps AI reasoning separate from workflow logic.
*/

export type TriageDecision = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
    action: "NURSE_TREAT" | "NURSE_OBSERVE" | "ESCALATE_DOCTOR" | "REVIEW_REQUIRED";
      recommendation: string;
        reasoning: string;
        };

        export function decideTriageAction(aiResult: any): TriageDecision {

          const risk = (aiResult?.riskLevel || "UNKNOWN").toUpperCase();

            let action: TriageDecision["action"] = "REVIEW_REQUIRED";

              switch (risk) {

                  case "LOW":
                        action = "NURSE_TREAT";
                              break;

                                  case "MEDIUM":
                                        action = "NURSE_OBSERVE";
                                              break;

                                                  case "HIGH":
                                                        action = "ESCALATE_DOCTOR";
                                                              break;

                                                                  default:
                                                                        action = "REVIEW_REQUIRED";
                                                                          }

                                                                            return {
                                                                                riskLevel: risk as TriageDecision["riskLevel"],
                                                                                    action,
                                                                                        recommendation: aiResult?.recommendation || "",
                                                                                            reasoning: aiResult?.clinicalReasoning || ""
                                                                                              };
                                                                                              }