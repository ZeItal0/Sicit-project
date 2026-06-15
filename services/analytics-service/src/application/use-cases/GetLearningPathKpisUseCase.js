export class GetLearningPathKpisUseCase {
  constructor(trainingServiceClient) {
    this.trainingServiceClient = trainingServiceClient;
  }

  async execute({ token }) {
    const [paths, results] = await Promise.all([
      this.trainingServiceClient.listLearningPaths(token),
      this.trainingServiceClient.listLearningPathResults(token)
    ]);

    const approvedResults = results.filter((result) => result.approved === true);

    const averageCompletion =
      results.length > 0
        ? Math.round(
            results.reduce((sum, result) => sum + Number(result.completionPercent || 0), 0) /
              results.length
          )
        : 0;

    return {
      totalLearningPaths: paths.length,
      totalLearningPathResults: results.length,
      completedLearningPaths: approvedResults.length,
      averageCompletionPercent: averageCompletion,
      pendingLearningPaths: results.length - approvedResults.length
    };
  }
}