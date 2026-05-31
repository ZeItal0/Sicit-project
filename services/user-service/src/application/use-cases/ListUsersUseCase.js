export class ListUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ tenantId }) {
    if (!tenantId) {
      throw new Error("TenantId é obrigatório");
    }

    return this.userRepository.findAllByTenantId(tenantId);
  }
}