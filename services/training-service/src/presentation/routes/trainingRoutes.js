import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

import { MongoTrainingRepository } from "../../infrastructure/repositories/MongoTrainingRepository.js";
import { MongoTrainingResultRepository } from "../../infrastructure/repositories/MongoTrainingResultRepository.js";
import { MongoLearningPathRepository } from "../../infrastructure/repositories/MongoLearningPathRepository.js";
import { MongoLearningPathResultRepository } from "../../infrastructure/repositories/MongoLearningPathResultRepository.js";
import { MongoLearningPathStepResultRepository } from "../../infrastructure/repositories/MongoLearningPathStepResultRepository.js";

import { UserServiceClient } from "../../infrastructure/services/UserServiceClient.js";
import { CommunicationServiceClient } from "../../infrastructure/services/CommunicationServiceClient.js";

import { HttpStreamServiceClient } from "../../infrastructure/services/HttpStreamServiceClient.js";
import { MoodleServiceClient } from "../../infrastructure/services/MoodleServiceClient.js";
import { AuditServiceClient } from "../../infrastructure/services/AuditServiceClient.js";

import { CertificatePdfGenerator } from "../../infrastructure/pdf/CertificatePdfGenerator.js";

import { CreateTrainingUseCase } from "../../application/use-cases/CreateTrainingUseCase.js";
import { GenerateTrainingPresenceReportUseCase } from "../../application/use-cases/GenerateTrainingPresenceReportUseCase.js";
import { GenerateTrainingResultsUseCase } from "../../application/use-cases/GenerateTrainingResultsUseCase.js";
import { GenerateTrainingCertificateUseCase } from "../../application/use-cases/GenerateTrainingCertificateUseCase.js";

import { CreateLearningPathUseCase } from "../../application/use-cases/CreateLearningPathUseCase.js";
import { AssignStreamToLearningPathStepUseCase } from "../../application/use-cases/AssignStreamToLearningPathStepUseCase.js";
import { GenerateLearningPathResultUseCase } from "../../application/use-cases/GenerateLearningPathResultUseCase.js";
import { GenerateLearningPathStepResultsUseCase } from "../../application/use-cases/GenerateLearningPathStepResultsUseCase.js";
import { GenerateLearningPathCertificateUseCase } from "../../application/use-cases/GenerateLearningPathCertificateUseCase.js";

import { SyncLearningPathResultToMoodleUseCase } from "../../application/use-cases/SyncLearningPathResultToMoodleUseCase.js";
import { RegisterAuditEventUseCase } from "../../application/use-cases/RegisterAuditEventUseCase.js";

import { TrainingController } from "../controllers/TrainingController.js";

const router = express.Router();

const trainingRepository = new MongoTrainingRepository();
const trainingResultRepository = new MongoTrainingResultRepository();

const pathRepository = new MongoLearningPathRepository();
const learningPathResultRepository = new MongoLearningPathResultRepository();
const learningPathStepResultRepository = new MongoLearningPathStepResultRepository();

const streamServiceClient = new HttpStreamServiceClient();
const moodleServiceClient = new MoodleServiceClient();
const auditServiceClient = new AuditServiceClient();

const certificatePdfGenerator = new CertificatePdfGenerator();

const createTrainingUseCase = new CreateTrainingUseCase(trainingRepository);

const userServiceClient = new UserServiceClient();
const communicationServiceClient = new CommunicationServiceClient();

const generateTrainingPresenceReportUseCase =
  new GenerateTrainingPresenceReportUseCase(
    trainingRepository,
    streamServiceClient
  );

const generateTrainingResultsUseCase =
  new GenerateTrainingResultsUseCase(
    generateTrainingPresenceReportUseCase,
    trainingResultRepository
  );

const generateTrainingCertificateUseCase =
  new GenerateTrainingCertificateUseCase(
    trainingRepository,
    trainingResultRepository,
    certificatePdfGenerator
  );

const createLearningPathUseCase =
  new CreateLearningPathUseCase(
    pathRepository,
    userServiceClient,
    communicationServiceClient,
    moodleServiceClient
  );

const assignStreamToLearningPathStepUseCase =
  new AssignStreamToLearningPathStepUseCase(pathRepository);

const generateLearningPathResultUseCase =
  new GenerateLearningPathResultUseCase(
    pathRepository,
    trainingResultRepository,
    learningPathResultRepository
  );

const generateLearningPathStepResultsUseCase =
  new GenerateLearningPathStepResultsUseCase(
    pathRepository,
    learningPathStepResultRepository,
    learningPathResultRepository,
    streamServiceClient,
    communicationServiceClient,
    moodleServiceClient
  );

const generateLearningPathCertificateUseCase =
  new GenerateLearningPathCertificateUseCase(
    pathRepository,
    learningPathResultRepository,
    certificatePdfGenerator
  );

const syncLearningPathResultToMoodleUseCase =
  new SyncLearningPathResultToMoodleUseCase(moodleServiceClient);

const registerAuditEventUseCase =
  new RegisterAuditEventUseCase(auditServiceClient);

const controller = new TrainingController(
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
);

router.get("/health", (req, res) => {res.json({ service: "training-service", status: "up", timestamp: new Date()});});


router.post("/paths", authMiddleware, controller.createLearningPath);
router.get("/paths", authMiddleware, controller.listLearningPaths);

router.put(
  "/paths/:pathId/steps/:stepId/stream",
  authMiddleware,
  controller.assignStreamToStep
);

router.post(
  "/paths/:pathId/steps/:stepId/results/generate",
  authMiddleware,
  controller.generateStepResults
);

router.get(
  "/paths/:pathId/me/step-results",
  authMiddleware,
  controller.listMyStepResultsByPath
);

router.get("/paths/me/results", authMiddleware, controller.listMyPathResults);

router.get(
  "/paths/:pathId/results",
  authMiddleware,
  controller.listPathResults
);

router.get("/paths/results/all", authMiddleware, controller.listAllPathResults);

router.post(
  "/paths/:pathId/certificate",
  authMiddleware,
  controller.generateLearningPathCertificate
);

export default router;