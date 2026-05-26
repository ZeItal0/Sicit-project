import { Training } from "../../domain/entities/Training.js";
import crypto from "crypto";

export class CreateTrainingUseCase {
  constructor(trainingRepository) {
    this.trainingRepository = trainingRepository;
  }

  async execute(data) {
    const training = new Training({
      id: crypto.randomUUID(),
      ...data
    });

    return await this.trainingRepository.create(training);
  }
}