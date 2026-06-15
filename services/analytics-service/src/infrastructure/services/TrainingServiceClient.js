import dotenv from "dotenv";

dotenv.config();

export class TrainingServiceClient {
  async listTrainings(token) {
    const response = await fetch(`${process.env.TRAINING_SERVICE_URL}/trainings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar treinamentos");
    }

    return data;
  }

  async listMyResults(token) {
    const response = await fetch(`${process.env.TRAINING_SERVICE_URL}/trainings/me/results`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar resultados");
    }

    return data;
  }

  async listLearningPaths(token) {
    const response = await fetch(`${process.env.TRAINING_SERVICE_URL}/trainings/paths`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar trilhas");
    }

    return data;
  }

  async listLearningPathResults(token) {
    const response = await fetch(`${process.env.TRAINING_SERVICE_URL}/trainings/paths/results/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar resultados das trilhas");
    }

    return data;
  }
}