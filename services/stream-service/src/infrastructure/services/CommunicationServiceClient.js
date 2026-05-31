import dotenv from "dotenv";

dotenv.config();

export class CommunicationServiceClient {
  async createLiveChatChannel({ token, title, description }) {
    const response = await fetch(
      `${process.env.COMMUNICATION_SERVICE_URL}/channels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Live - ${title}`,
          description: description || "Chat da transmissão",
          type: "public"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao criar canal de chat da live");
    }

    return data;
  }

  async joinChannel({ token, channelId }) {
    const response = await fetch(
      `${process.env.COMMUNICATION_SERVICE_URL}/channels/${channelId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao entrar no canal de chat");
    }

    return data;
  }

  async createNotification({ token, userId, type, content }) {
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