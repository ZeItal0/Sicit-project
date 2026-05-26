export class TrainingController {
  constructor(
    createTrainingUseCase,
    trainingRepository,
    generateTrainingPresenceReportUseCase,
    generateTrainingResultsUseCase,
    trainingResultRepository,
    pathRepository,
    generateLearningPathResultUseCase,
    learningPathResultRepository,
    generateTrainingCertificateUseCase,
    syncLearningPathResultToMoodleUseCase,
    registerAuditEventUseCase,
    createLearningPathUseCase,
    assignStreamToLearningPathStepUseCase,
    generateLearningPathStepResultsUseCase,
    learningPathStepResultRepository,
    generateLearningPathCertificateUseCase
  ) {
    this.createTrainingUseCase = createTrainingUseCase;
    this.trainingRepository = trainingRepository;
    this.generateTrainingPresenceReportUseCase = generateTrainingPresenceReportUseCase;
    this.generateTrainingResultsUseCase = generateTrainingResultsUseCase;
    this.trainingResultRepository = trainingResultRepository;
    this.pathRepository = pathRepository;
    this.generateLearningPathResultUseCase = generateLearningPathResultUseCase;
    this.learningPathResultRepository = learningPathResultRepository;
    this.generateTrainingCertificateUseCase = generateTrainingCertificateUseCase;
    this.syncLearningPathResultToMoodleUseCase = syncLearningPathResultToMoodleUseCase;
    this.registerAuditEventUseCase = registerAuditEventUseCase;
    this.createLearningPathUseCase = createLearningPathUseCase;
    this.assignStreamToLearningPathStepUseCase = assignStreamToLearningPathStepUseCase;
    this.generateLearningPathStepResultsUseCase = generateLearningPathStepResultsUseCase;
    this.learningPathStepResultRepository = learningPathStepResultRepository;
    this.generateLearningPathCertificateUseCase = generateLearningPathCertificateUseCase;
  }


  createLearningPath = async (req, res) => {
    try {
      const path = await this.createLearningPathUseCase.execute({
        ...req.body,
        tenantId: req.user.tenantId,
        createdBy: req.user.id,
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(201).json(path);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listAllPathResults = async (req, res) => {
    try {
      const results = await this.learningPathResultRepository.findAll();

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listLearningPaths = async (req, res) => {
    try {
      const paths = await this.pathRepository.findAll({
        tenantId: req.user.tenantId
      });

      return res.status(200).json(paths);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listMyStepResultsByPath = async (req, res) => {
    try {
      const results =
        await this.learningPathStepResultRepository.findByUserIdAndPathId(
          req.user.id,
          req.params.pathId
        );

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  generateStepResults = async (req, res) => {
    try {
      const result =
        await this.generateLearningPathStepResultsUseCase.execute({
          tenantId: req.user.tenantId,
          pathId: req.params.pathId,
          stepId: req.params.stepId,
          token: req.headers.authorization?.split(" ")[1]
        });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  generateLearningPathCertificate = async (req, res) => {
    try {
      const certificate =
        await this.generateLearningPathCertificateUseCase.execute({
          pathId: req.params.pathId,
          userId: req.user.id
        });

      return res.status(200).json({
        message: "Certificado da trilha gerado com sucesso",
        certificate,
        downloadUrl: certificate.downloadUrl
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  assignStreamToStep = async (req, res) => {
    try {
      const result = await this.assignStreamToLearningPathStepUseCase.execute({
        tenantId: req.user.tenantId,
        pathId: req.params.pathId,
        stepId: req.params.stepId,
        streamId: req.body.streamId,
        streamTitle: req.body.streamTitle
      });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  create = async (req, res) => {
    try {
      const training = await this.createTrainingUseCase.execute(req.body);
      return res.status(201).json(training);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  list = async (req, res) => {
    const trainings = await this.trainingRepository.findAll();
    return res.json(trainings);
  };

  report = async (req, res) => {
    try {
      const result = await this.generateTrainingPresenceReportUseCase.execute({
        trainingId: req.params.trainingId,
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  generateResults = async (req, res) => {
    try {
      const result = await this.generateTrainingResultsUseCase.execute({
        trainingId: req.params.trainingId,
        token: req.headers.authorization?.split(" ")[1]
      });

      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "TRAINING_RESULTS_GENERATED",
        resourceType: "TRAINING",
        resourceId: req.params.trainingId,
        metadata: {
          generatedBy: req.user.id,
          resultsCount: result.results.length
        }
      });

      return res.status(200).json({
        ...result,
        audit
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listResults = async (req, res) => {
    try {
      const results = await this.trainingResultRepository.findByTrainingId(
        req.params.trainingId
      );

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listMyResults = async (req, res) => {
    try {
      const results = await this.trainingResultRepository.findByUserId(req.user.id);

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  createPath = async (req, res) => {
    try {
      const path = await this.pathRepository.create(req.body);
      return res.status(201).json(path);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listPaths = async (req, res) => {
    try {
      const paths = await this.pathRepository.findAll();
      return res.status(200).json(paths);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  generatePathResult = async (req, res) => {
    try {
      const result = await this.generateLearningPathResultUseCase.execute({
        pathId: req.params.pathId,
        userId: req.user.id
      });

      let saved;

      if (result.id) {
        saved = result;
      } else {
        saved = await this.learningPathResultRepository.create(result);
      }

      const moodleSync = await this.syncLearningPathResultToMoodleUseCase.execute({
        result: saved
      });

      const moodleAudit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "MOODLE_SYNC_ATTEMPTED",
        resourceType: "LEARNING_PATH",
        resourceId: req.params.pathId,
        metadata: {
          userId: req.user.id,
          synced: moodleSync.synced,
          reason: moodleSync.reason || null
        }
      });

      let audit = null;

      if (saved.approved) {
        audit = await this.registerAuditEventUseCase.execute({
          token: req.headers.authorization?.split(" ")[1],
          action: "LEARNING_PATH_COMPLETED",
          resourceType: "LEARNING_PATH",
          resourceId: req.params.pathId,
          metadata: {
            userId: req.user.id,
            completionPercent: saved.completionPercent
          }
        });
      }

      return res.status(200).json({
        result: saved,
        moodleSync,
        audit,
        moodleAudit
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listPathResults = async (req, res) => {
    try {
      const results = await this.learningPathResultRepository.findByPathId(
        req.params.pathId
      );

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  listMyPathResults = async (req, res) => {
    try {
      const results = await this.learningPathResultRepository.findByUserId(req.user.id);

      return res.status(200).json(results);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  generateCertificate = async (req, res) => {
    try {
      const certificate = await this.generateTrainingCertificateUseCase.execute({
        trainingId: req.params.trainingId,
        userId: req.user.id
      });

      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "CERTIFICATE_GENERATED",
        resourceType: "TRAINING_CERTIFICATE",
        resourceId: req.params.trainingId,
        metadata: {
          userId: req.user.id,
          certificate
        }
      });

      return res.status(200).json({
        message: "Certificado gerado com sucesso",
        certificate,
        audit
      });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}