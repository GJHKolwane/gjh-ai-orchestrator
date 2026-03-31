export function detectRisk(input: {
  inputText: string;
  symptoms?: string[];
}) {
  const text = (input.inputText || "").toLowerCase();
  const symptoms = (input.symptoms || []).join(" ").toLowerCase();

  const combined = text + " " + symptoms;

  // 🔴 HIGH RISK KEYWORDS
  const highRiskKeywords = [
    "chest pain",
    "shortness of breath",
    "unconscious",
    "seizure",
    "severe bleeding",
    "stroke",
  ];

  for (const word of highRiskKeywords) {
    if (combined.includes(word)) {
      return "HIGH";
    }
  }

  // 🟡 MEDIUM
  if (combined.length > 20) {
    return "MEDIUM";
  }

  // 🟢 LOW
  return "LOW";
}
