import { User } from "../../domain/entities/User.js";

export class LoginUseCase {
  constructor(authProvider, tokenService) {
    this.authProvider = authProvider;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const authenticatedUser = await this.authProvider.authenticate({
      email,
      password
    });

    const user = new User({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      tenantId: authenticatedUser.tenantId
    });

    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    });

    return {
      message: "Login realizado com sucesso",
      token,
      user
    };
  }
}