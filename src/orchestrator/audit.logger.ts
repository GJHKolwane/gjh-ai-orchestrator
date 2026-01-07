/**
 * Audit Logger
 *
 * Purpose:
 * - Record all AI-related actions for accountability
 * - Enable nurse / doctor review
 * - Support future compliance (GDPR, HIPAA, local health laws)
 *
 * IMPORTANT:
 * - This file does NOT care about cloud, DB, or transport
 * - It only defines the audit event contract and logger interface
 */

export type ActorType =
  | "PATIENT"
  | "AI_TRIAGE"
  | "NURSE"
  | "DOCTOR"
  | "SYSTEM";

export type AuditAction =
  | "INPUT_RECEIVED"
  | "AI_SUGGESTION"
  | "NURSE_REVIEW"
  | "NURSE_OVERRIDE"
  | "DOCTOR_QUERY"
  | "DOCTOR_DECISION"
  | "ESCALATION"
  | "FINALIZED";

export interface AuditEvent {
  consultationId: string;
  actor: ActorType;
  action: AuditAction;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Core Audit Logger Interface
 *
 * Implementations can log to:
 * - DynamoDB (AWS)
 * - Firestore / BigQuery (GCP)
 * - File / Console (local dev)
 * - Government private systems
 */
export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

/**
 * Default Console Audit Logger
 *
 * Used for:
 * - Local development
 * - Testing
 * - Mobile / low-connectivity environments
 */
export class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    console.log("[AUDIT]", JSON.stringify(event, null, 2));
  }
}

/**
 * Helper to create a standard audit event
 */
export function createAuditEvent(
  consultationId: string,
  actor: ActorType,
  action: AuditAction,
  message: string,
  metadata?: Record<string, any>
): AuditEvent {
  return {
    consultationId,
    actor,
    action,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  };
}
