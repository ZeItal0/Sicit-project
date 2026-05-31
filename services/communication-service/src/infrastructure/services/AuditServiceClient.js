import dotenv from "dotenv";

dotenv.config();

export class AuditServiceClient {
  async createEvent({ token, action, resourceType, resourceId, metadata }) {
    try {
      const response = await fetch(`${process.env.AUDIT_SERVICE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          resourceType,
          resourceId,
          metadata
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          audited: false,
          reason: data.message || "Erro ao registrar auditoria"
        };
      }

      return {
        audited: true,
        event: data
      };
    } catch (error) {
      return {
        audited: false,
        reason: error.message
      };
    }
  }
}