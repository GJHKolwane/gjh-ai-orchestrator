import { AIMode } from "./ai.modes.js";

/*
================================================
AI MODE GOVERNANCE GUARD
================================================
Ensures that AI usage complies with allowed mode.
*/

export function assertAIModeAllows(
  mode: AIMode,
    intent: any
    ) {

      if (!mode) {
          throw new Error("AI mode not specified");
            }

              /*
                Example governance rules
                  */

                    if (mode === AIMode.CLINICAL && intent?.diagnosis) {
                        throw new Error(
                              "Clinical AI mode cannot produce final diagnosis"
                                  );
                                    }

                                    }