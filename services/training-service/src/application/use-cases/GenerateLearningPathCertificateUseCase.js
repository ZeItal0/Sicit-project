export class GenerateLearningPathCertificateUseCase {
  constructor(
    learningPathRepository,
    learningPathResultRepository,
    certificatePdfGenerator
  ) {
    this.learningPathRepository = learningPathRepository;
    this.learningPathResultRepository = learningPathResultRepository;
    this.certificatePdfGenerator = certificatePdfGenerator;
  }

  async execute({ pathId, userId }) {
    const path = await this.learningPathRepository.findById(pathId);

    if (!path) {
      throw new Error("Trilha não encontrada");
    }

    const result =
      await this.learningPathResultRepository.findByUserIdAndPathId(
        userId,
        pathId
      );

    if (!result) {
      throw new Error("Resultado da trilha não encontrado");
    }

    if (!result.approved) {
      throw new Error("Usuário ainda não concluiu a trilha");
    }

    const { fileName } = await this.certificatePdfGenerator.generate({
      userName: result.userName || result.email || userId,
      email: result.email || "",
      trainingTitle: path.title,
      result: {
        ...result,
        attendancePercent: result.completionPercent,
        status: "Aprovado"
      }
    });

    return {
      fileName,
      downloadUrl: `${process.env.BASE_URL}/certificates/${fileName}`
    };
  }
}