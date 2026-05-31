import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class LoginWithGoogleUseCase {
  constructor(googleOAuthClient, googleUserRepository) {
    this.googleOAuthClient = googleOAuthClient;
    this.googleUserRepository = googleUserRepository;
  }

  async execute({ idToken }) {
    if (!idToken) {
      throw new Error("Token do Google não informado");
    }

    const googleUser = await this.googleOAuthClient.verifyToken(idToken);

    if (!googleUser.emailVerified) {
      throw new Error("E-mail do Google não verificado");
    }

    const savedUser = await this.googleUserRepository.upsert({
      googleId: googleUser.googleId,
      name: googleUser.name,
      email: googleUser.email,
      picture: googleUser.picture
    });

    const token = jwt.sign(
      {
        id: savedUser.id,
        googleId: savedUser.googleId,
        email: savedUser.email,
        name: savedUser.name,
        picture: savedUser.picture,
        role: savedUser.role,
        tenantId: savedUser.tenantId,
        authProvider: "GOOGLE"
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    return {
      message: "Login com Google realizado com sucesso",
      token,
      user: {
        id: savedUser.id,
        googleId: savedUser.googleId,
        email: savedUser.email,
        name: savedUser.name,
        picture: savedUser.picture,
        role: savedUser.role,
        tenantId: savedUser.tenantId,
        authProvider: "GOOGLE"
      }
    };
  }
}