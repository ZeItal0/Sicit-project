import dotenv from "dotenv";
import { StreamServiceClient } from "../../domain/ports/StreamServiceClient.js";

dotenv.config();

export class HttpStreamServiceClient extends StreamServiceClient {
  async getStreamById(streamId, token) {
    const response = await fetch(
      `${process.env.STREAM_SERVICE_URL}/streams/${streamId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar transmissão");
    }

    return data;
  }

  async getStreamPresences(streamId, token) {
    const response = await fetch(
      `${process.env.STREAM_SERVICE_URL}/streams/${streamId}/presences`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar presenças");
    }

    return data;
  }
}