export class SyncTrainingResultToMoodleUseCase {
  constructor(moodleServiceClient) {
    this.moodleServiceClient = moodleServiceClient;
  }

  async execute({ trainingResult, moodleUserId, moodleCourseId }) {
    if (!trainingResult) {
      throw new Error("Resultado do treinamento é obrigatório");
    }

    if (!trainingResult.approved) {
      return {
        synced: false,
        reason: "Usuário ainda não aprovado no treinamento"
      };
    }

    if (!moodleUserId || !moodleCourseId) {
      return {
        synced: false,
        reason: "moodleUserId ou moodleCourseId não informado"
      };
    }

    await this.moodleServiceClient.enrolUser({
      moodleUserId,
      moodleCourseId
    });

    await this.moodleServiceClient.addCourseNote({
      moodleUserId,
      moodleCourseId,
      text: `SICIT: treinamento concluído. Presença: ${trainingResult.attendancePercent}%. Tempo assistido: ${trainingResult.watchedSeconds}s.`
    });

    return {
      synced: true,
      type: "TRAINING_RESULT",
      moodleUserId,
      moodleCourseId
    };
  }
}