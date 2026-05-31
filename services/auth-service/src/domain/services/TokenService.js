import jwt from "jsonwebtoken";

export class TokenService {
  constructor(secret) {
    this.secret = secret;
  }

  generate(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: "4h" });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}