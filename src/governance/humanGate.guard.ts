/*
================================================
HUMAN-IN-THE-LOOP GUARD
================================================
Ensures AI never outputs medical directives
*/

const forbiddenPatterns = [
  /prescribe/i,
  /treatment:/i,
  /administer/i,
  /dosage/i,
  /take \d+ mg/i,
  /start medication/i
];

export function enforceHumanGate(text: string): string {

  let sanitized = text;

  forbiddenPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  });

  return sanitized;

}
