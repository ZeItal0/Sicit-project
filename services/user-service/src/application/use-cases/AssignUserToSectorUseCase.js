export class AssignUserToSectorUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, sectorId }) {
    if (!userId) {
      throw new Error("userId obrigatório");
    }

    return this.userRepository.assignSector(userId, sectorId ?? null);
  }
}