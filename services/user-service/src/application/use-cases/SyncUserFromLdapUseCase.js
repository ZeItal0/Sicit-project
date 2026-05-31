export class SyncUserFromLdapUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ tenantId, name, email, externalId }) {
    if (!tenantId || !name || !email || !externalId) {
      throw new Error("Campos obrigatórios não informados para sincronização LDAP");
    }

    return this.userRepository.syncFromLdap({
      tenantId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      externalId,
    });
  }
}