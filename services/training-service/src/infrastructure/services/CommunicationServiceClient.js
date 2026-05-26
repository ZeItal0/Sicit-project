import dotenv from "dotenv";

dotenv.config();

export class CommunicationServiceClient {
  async createNotification({
    token,
    userId,
    type,
    content
  }) {
    const response = await fetch(
      `${process.env.COMMUNICATION_SERVICE_URL}/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          type,
          content
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao criar notificação");
    }

    return data;
  }
}