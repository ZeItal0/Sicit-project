export class TestLdapConnectionUseCase {
  constructor() {}

  async execute({ ldapUrl, bindDn, bindPassword }) {
    if (!ldapUrl || !bindDn || !bindPassword) {
      throw new Error("Dados LDAP incompletos");
    }

    const provider = new (await import("../../infrastructure/auth/LdapAuthProvider.js"))
      .LdapAuthProvider({
        ldapUrl,
        bindDn,
        bindPassword
      });

    try {
      await provider.testConnection();

      return {
        success: true,
        message: "Conexão LDAP bem-sucedida"
      };

    } catch (error) {
      return {
        success: false,
        message: "Falha na conexão LDAP",
        error: error.message
      };
    }
  }
}