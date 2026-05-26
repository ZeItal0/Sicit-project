export class GenerateTrainingCertificateUseCase {
  constructor(trainingRepository, trainingResultRepository, certificatePdfGenerator) {
    this.trainingRepository = trainingRepository;
    this.trainingResultRepository = trainingResultRepository;
    this.certificatePdfGenerator = certificatePdfGenerator;
  }

  async execute({ trainingId, userId }) {
    const training = await this.trainingRepository.findById(trainingId);

    if (!training) {
      throw new Error("Treinamento não encontrado");
    }

    const results = await this.trainingResultRepository.findByUserId(userId);

    const result = results.find((item) => item.trainingId === trainingId);

    if (!result) {
      throw new Error("Resultado do treinamento não encontrado");
    }

    if (!result.approved) {
      throw new Error("Usuário não aprovado para emissão de certificado");
    }

    const { fileName } = await this.certificatePdfGenerator.generate({
      userName: result.email,
      email: result.email,
      trainingTitle: training.title,
      result
    });

    return {
      fileName,
      downloadUrl: `${process.env.BASE_URL}/certificates/${fileName}`
    };
  }
}