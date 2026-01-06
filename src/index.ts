import { orchestrateAI } from "./orchestrator/ai.orchestrator.js";

async function main() {
  const result = await orchestrateAI(
    "Give a one-paragraph explanation of GJHealth for a government briefing."
  );

  console.log("\n=== GJHealth AI Output ===\n");
  console.log(result.output);
}

main().catch(console.error);
