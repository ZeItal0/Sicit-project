export class SyncLearningPathResultToMoodleUseCase {
  constructor(moodleServiceClient) {
    this.moodleServiceClient = moodleServiceClient;
  }

  async execute({ result }) {
    if (!result) {
      throw new Error("Resultado da trilha é obrigatório");
    }

    return this.moodleServiceClient.syncLearningPathResult(result);
  }
}