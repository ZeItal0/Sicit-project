export class AssignUserToRoleUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, roleId }) {
    if (!userId) {
      throw new Error("userId obrigatório");
    }

    return this.userRepository.assignRole(userId, roleId || null);
  }
}