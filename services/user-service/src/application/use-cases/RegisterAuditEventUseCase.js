export class RegisterAuditEventUseCase {
  constructor(auditServiceClient) {
    this.auditServiceClient = auditServiceClient;
  }

  async execute({ token, action, resourceType, resourceId, metadata }) {
    if (!action || !resourceType || !resourceId) {
      return {
        audited: false,
        reason: "Dados obrigatórios de auditoria não informados"
      };
    }

    if (!token) {
      return {
        audited: false,
        reason: "Token não informado"
      };
    }

    return this.auditServiceClient.createEvent({
      token,
      action,
      resourceType,
      resourceId,
      metadata
    });
  }
}