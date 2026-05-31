import bcrypt from "bcrypt";
import { PasswordHashService } from "../../domain/services/PasswordHashService.js";

export class BcryptPasswordHashService extends PasswordHashService {
  async hash(value) {
    return bcrypt.hash(value, 10);
  }

  async compare(value, hash) {
    return bcrypt.compare(value, hash);
  }
}