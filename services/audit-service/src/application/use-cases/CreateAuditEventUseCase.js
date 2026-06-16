import crypto from "crypto";
import { AuditEvent } from "../../domain/entities/AuditEvent.js";

export class CreateAuditEventUseCase {
  constructor(auditEventRepository) {
    this.auditEventRepository = auditEventRepository;
  }

  async execute({
    tenantId,
    userId,
    userEmail,
    action,
    resourceType,
    resourceId,
    metadata
  }) {
    if (!tenantId || !userId || !action || !resourceType) {
      throw new Error("Campos obrigatórios não informados");
    }

    const event = new AuditEvent({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      userEmail,
      action,
      resourceType,
      resourceId: resourceId || null,
      metadata: metadata || {}
    });

    return this.auditEventRepository.create(event);
  }
}