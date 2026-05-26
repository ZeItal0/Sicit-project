export class TrainingResultRepository {
  async upsert(_result) {
    throw new Error("Método upsert precisa ser implementado");
  }

  async findByTrainingId(_trainingId) {
    throw new Error("Método findByTrainingId precisa ser implementado");
  }

  async findByUserId(_userId) {
    throw new Error("Método findByUserId precisa ser implementado");
  }
}