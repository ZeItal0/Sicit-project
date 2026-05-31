export class LoginEmployeeUseCase {
  constructor(
    tenantRepository,
    tenantLdapConfigRepository,
    tokenService,
    ldapAuthProviderFactory,
    userSyncService
  ) {
    this.tenantRepository = tenantRepository;
    this.tenantLdapConfigRepository = tenantLdapConfigRepository;
    this.tokenService = tokenService;
    this.ldapAuthProviderFactory = ldapAuthProviderFactory;
    this.userSyncService = userSyncService;
  }

  async execute({ domain, login, password }) {
    if (!domain || !login || !password) {
      throw new Error("Domínio, login e senha são obrigatórios");
    }

    const tenant = await this.tenantRepository.findByDomain(domain);
    if (!tenant) {
      throw new Error("Tenant não encontrado");
    }

    const ldapConfig = await this.tenantLdapConfigRepository.findByTenantId(tenant.id);
    if (!ldapConfig || !ldapConfig.isActive) {
      throw new Error("LDAP não configurado para este tenant");
    }

    const ldapAuthProvider = this.ldapAuthProviderFactory({
      url: ldapConfig.ldapUrl,
      bindDN: ldapConfig.bindDn,
      bindPassword: ldapConfig.bindPassword,
      baseDN: ldapConfig.baseDn,
      userAttribute: ldapConfig.userAttribute,
      tenantId: tenant.id
    });

    const authenticatedUser = await ldapAuthProvider.authenticate({
      login,
      password
    });

    const syncedUser = await this.userSyncService.syncFromLdap({
      tenantId: authenticatedUser.tenantId,
      name: authenticatedUser.name || authenticatedUser.email,
      email: authenticatedUser.email,
      externalId: authenticatedUser.id
    });

    const token = this.tokenService.generate({
      id: syncedUser.id,
      email: syncedUser.email,
      role: syncedUser.role?.name || authenticatedUser.role,
      tenantId: syncedUser.tenantId
    });

    return {
      message: "Login do colaborador realizado com sucesso",
      token,
      user: {
        ...syncedUser,
        role: syncedUser.role?.name || authenticatedUser.role
      }
    };
  }
}