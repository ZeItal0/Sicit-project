export class GetTrainingKpisUseCase {
  constructor(trainingServiceClient, auditServiceClient) {
    this.trainingServiceClient = trainingServiceClient;
    this.auditServiceClient = auditServiceClient;
  }

  async execute({ token }) {
    const [trainings, events] = await Promise.all([
      this.trainingServiceClient.listTrainings(token),
      this.auditServiceClient.listEvents(token)
    ]);

    const certificates = events.filter((event) => event.action === "CERTIFICATE_GENERATED");
    const resultsGenerated = events.filter((event) => event.action === "TRAINING_RESULTS_GENERATED");
    const pathsCompleted = events.filter((event) => event.action === "LEARNING_PATH_COMPLETED");
    const moodleSyncs = events.filter((event) => event.action === "MOODLE_SYNC_ATTEMPTED");

    return {
      totalTrainings: trainings.length,
      trainingResultsGenerated: resultsGenerated.length,
      certificatesGenerated: certificates.length,
      learningPathsCompleted: pathsCompleted.length,
      moodleSyncAttempts: moodleSyncs.length
    };
  }
}