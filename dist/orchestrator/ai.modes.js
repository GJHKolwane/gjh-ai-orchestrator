/*
=====================================================
AI OPERATING MODES
=====================================================

Defines what type of reasoning the AI is allowed to perform.
These modes are enforced by the AI guardrails.
*/
export var AIMode;
(function (AIMode) {
    /*
      General assistant behaviour
        */
    AIMode["GENERAL"] = "GENERAL";
    /*
      Clinical reasoning (triage, diagnosis assistance)
        */
    AIMode["CLINICAL"] = "CLINICAL";
    /*
      Medication reasoning
        */
    AIMode["PRESCRIPTION"] = "PRESCRIPTION";
    /*
      Administrative reasoning
        */
    AIMode["ADMIN"] = "ADMIN";
})(AIMode || (AIMode = {}));
