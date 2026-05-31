import dotenv from "dotenv";

dotenv.config();

export class UserServiceClient {
  async getUsers(token) {
    const response = await fetch(
      `${process.env.USER_SERVICE_URL}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Erro ao buscar usuários"
      );
    }

    return data;
  }
}