export class AuthProvider {
  async authenticate(_credentials) {
    throw new Error("Método authenticate precisa ser implementado");
  }
}