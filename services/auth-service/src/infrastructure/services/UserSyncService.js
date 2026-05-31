import dotenv from "dotenv";

dotenv.config();

export class UserSyncService {
  async syncFromLdap({ tenantId, name, email, externalId }) {
    const response = await fetch(
      `${process.env.USER_SERVICE_URL}/internal/users/sync-from-ldap`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-api-key": process.env.INTERNAL_API_KEY,
        },
        body: JSON.stringify({
          tenantId,
          name,
          email,
          externalId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Falha ao sincronizar usuário no user-service");
    }

    return response.json();
  }
}