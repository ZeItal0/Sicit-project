export class AssignStreamToLearningPathStepUseCase {
  constructor(learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  async execute({ tenantId, pathId, stepId, streamId, streamTitle }) {
    if (!tenantId || !pathId || !stepId || !streamId) {
      throw new Error("tenantId, pathId, stepId e streamId são obrigatórios");
    }

    const path = await this.learningPathRepository.findById(pathId);

    if (!path) {
      throw new Error("Trilha não encontrada");
    }

    if (path.tenantId !== tenantId) {
      throw new Error("Trilha não pertence a este tenant");
    }

    const step = path.steps.find((item) => item.id === stepId);

    if (!step) {
      throw new Error("Etapa não encontrada");
    }

    if (step.type !== "LIVE") {
      throw new Error("Somente etapas do tipo LIVE podem receber uma transmissão");
    }

    return this.learningPathRepository.assignStreamToStep({
      pathId,
      stepId,
      streamId,
      streamTitle
    });
  }
}