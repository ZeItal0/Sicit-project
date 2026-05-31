import dotenv from "dotenv";

dotenv.config();

export class UserServiceClient {
  async getUserByExternalId({ token, externalId }) {
    const encodedExternalId = encodeURIComponent(externalId);

    const response = await fetch(
      `${process.env.USER_SERVICE_URL}/users/by-external-id/${encodedExternalId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao buscar usuário no user-service");
    }

    return response.json();
  }
}