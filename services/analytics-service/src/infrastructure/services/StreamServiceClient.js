import dotenv from "dotenv";

dotenv.config();

export class StreamServiceClient {
  async listStreams(token) {
    const response = await fetch(`${process.env.STREAM_SERVICE_URL}/streams`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar transmissões");
    }

    return data;
  }
}