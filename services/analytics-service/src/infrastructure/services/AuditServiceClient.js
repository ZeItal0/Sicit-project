import dotenv from "dotenv";

dotenv.config();

export class AuditServiceClient {
  async listEvents(token) {
    const response = await fetch(`${process.env.AUDIT_SERVICE_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar eventos de auditoria");
    }

    return data;
  }
}