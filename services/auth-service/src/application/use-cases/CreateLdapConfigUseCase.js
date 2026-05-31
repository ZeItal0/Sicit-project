export class CreateLdapConfigUseCase {
  constructor(ldapRepository) {
    this.ldapRepository = ldapRepository;
  }

  async execute(data) {
    if (!data.tenantId) {
      throw new Error("TenantId obrigatório");
    }

    return this.ldapRepository.create(data);
  }
}