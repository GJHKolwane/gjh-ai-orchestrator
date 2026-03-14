/*
================================================
OFFLINE TRIAGE ENGINE
================================================
Fallback triage when AI services are unreachable.

Uses basic clinical safety rules to estimate risk.
This ensures rural facilities can continue triage
even when internet connectivity is unavailable.
*/

export function runOfflineTriage(patient: any, vitals: any, symptoms: any[]) {

  const observations: string[] = [];
  const considerations: string[] = [];

  let riskLevel = "LOW";

  /*
  ============================================
  VITALS SAFETY RULES
  ============================================
  */

  const temperature = parseFloat(vitals?.temperature);
  const heartRate = parseFloat(vitals?.heartRate);
  const bloodPressure = vitals?.bloodPressure;

  if (!isNaN(temperature)) {

    if (temperature >= 39) {
      observations.push("High fever detected");
      considerations.push("Possible infection");
      riskLevel = "HIGH";
    }

    if (temperature >= 38 && riskLevel !== "HIGH") {
      observations.push("Elevated temperature");
      considerations.push("Monitor for infection");
      riskLevel = "MEDIUM";
    }

  }

  if (!isNaN(heartRate)) {

    if (heartRate > 120) {
      observations.push("Tachycardia detected");
      considerations.push("Possible dehydration or infection");
      riskLevel = "HIGH";
    }

    if (heartRate > 100 && riskLevel === "LOW") {
      observations.push("Elevated heart rate");
      considerations.push("Monitor cardiovascular stress");
      riskLevel = "MEDIUM";
    }

  }

  if (bloodPressure) {

    const parts = bloodPressure.split("/");

    if (parts.length === 2) {

      const systolic = parseInt(parts[0]);
      const diastolic = parseInt(parts[1]);

      if (systolic < 90) {
        observations.push("Low blood pressure detected");
        considerations.push("Possible shock or dehydration");
        riskLevel = "HIGH";
      }

      if (systolic > 160 && riskLevel !== "HIGH") {
        observations.push("Elevated blood pressure");
        considerations.push("Possible hypertension risk");
        riskLevel = "MEDIUM";
      }

    }

  }

  /*
  ============================================
  SYMPTOM ANALYSIS
  ============================================
  */

  const symptomNames = (symptoms || []).map(s => s.name?.toLowerCase());

  if (symptomNames.includes("chest pain")) {

    observations.push("Chest pain reported");
    considerations.push("Possible cardiac issue");

    riskLevel = "HIGH";
  }

  if (symptomNames.includes("difficulty breathing")) {

    observations.push("Breathing difficulty reported");
    considerations.push("Possible respiratory distress");

    riskLevel = "HIGH";
  }

  if (symptomNames.includes("severe headache") && riskLevel === "LOW") {

    observations.push("Severe headache reported");
    considerations.push("Possible neurological issue");

    riskLevel = "MEDIUM";
  }

  /*
  ============================================
  DEFAULT FALLBACK
  ============================================
  */

  if (observations.length === 0) {

    observations.push("No critical abnormalities detected");
    considerations.push("Continue monitoring patient condition");

  }

  /*
  ============================================
  RETURN STRUCTURED RESULT
  ============================================
  */

  return {

    riskLevel,
    observations,
    considerations,
    source: "OFFLINE_RULE_ENGINE"

  };

  }
