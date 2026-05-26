import crypto from "crypto";
import { TrainingResult } from "../../domain/entities/TrainingResult.js";

export class GenerateTrainingResultsUseCase {
  constructor(generateTrainingPresenceReportUseCase, trainingResultRepository) {
    this.generateTrainingPresenceReportUseCase = generateTrainingPresenceReportUseCase;
    this.trainingResultRepository = trainingResultRepository;
  }

  async execute({ trainingId, token }) {
    const reportData = await this.generateTrainingPresenceReportUseCase.execute({
      trainingId,
      token
    });

    const savedResults = [];

    for (const item of reportData.report) {
      const approved = item.status === "COMPLETED";

      const result = new TrainingResult({
        id: crypto.randomUUID(),
        trainingId: reportData.training.id,
        userId: item.userId,
        email: item.email,
        attendancePercent: item.attendancePercent,
        watchedSeconds: item.watchedSeconds,
        requiredPercent: item.requiredPercent,
        status: item.status,
        approved
      });

      const saved = await this.trainingResultRepository.upsert(result);
      savedResults.push(saved);
    }

    return {
      training: reportData.training,
      stream: reportData.stream,
      results: savedResults
    };
  }
}