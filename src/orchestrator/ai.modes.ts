/*
=====================================================
AI OPERATING MODES
=====================================================

Defines what type of reasoning the AI is allowed to perform.
These modes are enforced by the AI guardrails.
*/

export enum AIMode {

  /*
    General assistant behaviour
      */
        GENERAL = "GENERAL",

          /*
            Clinical reasoning (triage, diagnosis assistance)
              */
                CLINICAL = "CLINICAL",

                  /*
                    Medication reasoning
                      */
                        PRESCRIPTION = "PRESCRIPTION",

                          /*
                            Administrative reasoning
                              */
                                ADMIN = "ADMIN"

                                }