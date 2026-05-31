export class UpdateUserStatusUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, status }) {
    if (!userId || !status) {
      throw new Error("userId e status obrigatórios");
    }

    return this.userRepository.updateStatus(userId, status);
  }
}