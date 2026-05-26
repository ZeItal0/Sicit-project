export class GenerateLearningPathResultUseCase {
    constructor(pathRepository, trainingResultRepository, learningPathResultRepository) {
        this.pathRepository = pathRepository;
        this.trainingResultRepository = trainingResultRepository;
        this.learningPathResultRepository = learningPathResultRepository;
    }

    async execute({ pathId, userId }) {
        const path = await this.pathRepository.findById(pathId);

        if (!path) {
            throw new Error("Trilha não encontrada");
        }

        const results = await this.trainingResultRepository.findByUserId(userId);

        const completedTrainings = path.trainings.filter((trainingId) =>
            results.some(
                (r) =>
                    r.trainingId === trainingId &&
                    r.status === "COMPLETED"
            )
        );

        const totalTrainings = path.trainings.length;

        const completionPercent = Math.round(
            (completedTrainings.length / totalTrainings) * 100
        );

        const approved =
            completionPercent >= path.minCompletionPercent;

        const data = {
            userId,
            pathId,
            completedTrainings: completedTrainings.length,
            totalTrainings,
            completionPercent,
            approved,
            generatedAt: new Date()
        };
        const existing = await this.learningPathResultRepository.findByUserIdAndPathId(
            userId,
            pathId
        );

        if (existing) {
            return await this.learningPathResultRepository.update(existing.id, data);
        }

        return data;
    }
}