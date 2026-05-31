export class RegisterAuditEventUseCase {
  constructor(auditServiceClient) {
    this.auditServiceClient = auditServiceClient;
  }

  async execute({ token, action, resourceType, resourceId, metadata }) {
    if (!token) {
      return {
        audited: false,
        reason: "Token não informado para auditoria"
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