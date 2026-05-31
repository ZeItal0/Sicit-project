export class PasswordHashService {
  async hash(_value) {
    throw new Error("Método hash precisa ser implementado");
  }

  async compare(_value, _hash) {
    throw new Error("Método compare precisa ser implementado");
  }
}