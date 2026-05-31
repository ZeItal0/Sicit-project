export class LoginTenantAdminUseCase {
  constructor(
    tenantRepository,
    tenantAdminRepository,
    passwordHashService,
    tokenService
  ) {
    this.tenantRepository = tenantRepository;
    this.tenantAdminRepository = tenantAdminRepository;
    this.passwordHashService = passwordHashService;
    this.tokenService = tokenService;
  }

  async execute({ domain, email, password }) {
    if (!domain || !email || !password) {
      throw new Error("Domínio, email e senha são obrigatórios");
    }

    const tenant = await this.tenantRepository.findByDomain(domain);
    if (!tenant) {
      throw new Error("Tenant não encontrado");
    }

    const admin = await this.tenantAdminRepository.findByEmailAndTenantId(email, tenant.id);
    if (!admin) {
      throw new Error("Admin não encontrado");
    }

    const passwordMatch = await this.passwordHashService.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      throw new Error("Credenciais inválidas");
    }

    const token = this.tokenService.generate({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      tenantId: tenant.id
    });

    return {
      message: "Login do admin realizado com sucesso",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: tenant.id
      }
    };
  }
}