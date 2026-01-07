/**
 * The ONLY legal exit reasons from a clinical phase.
 * Anything else is a governance violation.
 */
export enum PhaseExitType {
  TRANSFER_COMPLETE = "TRANSFER_COMPLETE",
  DELAY_OR_DETERIORATION = "DELAY_OR_DETERIORATION",
  TRANSFER_CANCELLED = "TRANSFER_CANCELLED",
  ACUTE_EMERGENCY = "ACUTE_EMERGENCY"
}
