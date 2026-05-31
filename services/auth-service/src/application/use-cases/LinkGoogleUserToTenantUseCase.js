export class LinkGoogleUserToTenantUseCase {
  constructor(googleUserRepository, tenantRepository) {
    this.googleUserRepository = googleUserRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute({ googleUserId, domain }) {
    if (!googleUserId || !domain) {
      throw new Error("GoogleUserId e domínio são obrigatórios");
    }

    let tenant = await this.tenantRepository.findByDomain(domain);

    if (!tenant) {
      tenant = await this.tenantRepository.create({
        companyName: domain,
        domain
      });
    }

    return this.googleUserRepository.linkToTenantAsAdmin({
      googleUserId,
      tenantId: tenant.id
    });
  }
}