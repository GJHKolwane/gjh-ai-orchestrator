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
/**
 * Default Console Audit Logger
 *
 * Used for:
 * - Local development
 * - Testing
 * - Mobile / low-connectivity environments
 */
export class ConsoleAuditLogger {
    async log(event) {
        console.log("[AUDIT]", JSON.stringify(event, null, 2));
    }
}
/**
 * Helper to create a standard audit event
 */
export function createAuditEvent(consultationId, actor, action, message, metadata) {
    return {
        consultationId,
        actor,
        action,
        message,
        metadata,
        timestamp: new Date().toISOString(),
    };
}
