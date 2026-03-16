/*
================================================
CLINICAL SAFETY ENGINE
Deterministic safety checks before AI reasoning
================================================
*/

export interface SafetyAlert {
  type: string;
  severity: "low" | "moderate" | "high" | "critical";
  message: string;
}

export interface SafetyResult {
  alerts: SafetyAlert[];
  highestSeverity: "none" | "low" | "moderate" | "high" | "critical";
}

function determineSeverity(alerts: SafetyAlert[]): SafetyResult["highestSeverity"] {

  if (alerts.some(a => a.severity === "critical")) return "critical";
  if (alerts.some(a => a.severity === "high")) return "high";
  if (alerts.some(a => a.severity === "moderate")) return "moderate";
  if (alerts.some(a => a.severity === "low")) return "low";

  return "none";
}

export function runClinicalSafetyChecks(
  patient: any,
  vitals: any,
  symptoms: any[]
): SafetyResult {

  const alerts: SafetyAlert[] = [];

  const temperature = vitals?.temperature;
  const heartRate = vitals?.heartRate;
  const bloodPressure = vitals?.bloodPressure;

  /*
  ================================================
  SEPSIS RISK
  ================================================
  */

  if (temperature >= 39 && heartRate >= 120) {
    alerts.push({
      type: "possible_sepsis",
      severity: "critical",
      message: "High fever with tachycardia may indicate severe infection."
    });
  }

  /*
  ================================================
  HYPERTENSIVE CRISIS
  ================================================
  */

  if (bloodPressure && typeof bloodPressure === "string") {

    const parts = bloodPressure.split("/");
    const systolic = Number(parts[0]);
    const diastolic = Number(parts[1]);

    if (systolic >= 180 || diastolic >= 120) {

      alerts.push({
        type: "hypertensive_crisis",
        severity: "critical",
        message: "Blood pressure indicates possible hypertensive crisis."
      });

    }

  }

  /*
  ================================================
  TACHYCARDIA
  ================================================
  */

  if (heartRate >= 120) {
    alerts.push({
      type: "tachycardia",
      severity: "moderate",
      message: "Elevated heart rate detected."
    });
  }

  /*
  ================================================
  HIGH FEVER
  ================================================
  */

  if (temperature >= 39) {
    alerts.push({
      type: "high_fever",
      severity: "moderate",
      message: "High fever detected."
    });
  }

  /*
  ================================================
  HYPOTHERMIA
  ================================================
  */

  if (temperature && temperature < 35) {
    alerts.push({
      type: "hypothermia",
      severity: "high",
      message: "Low body temperature detected."
    });
  }

  return {
    alerts,
    highestSeverity: determineSeverity(alerts)
  };

}
