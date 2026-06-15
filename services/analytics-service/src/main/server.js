import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { AuditServiceClient } from "../infrastructure/services/AuditServiceClient.js";
import { TrainingServiceClient } from "../infrastructure/services/TrainingServiceClient.js";
import { StreamServiceClient } from "../infrastructure/services/StreamServiceClient.js";
import { UserServiceClient } from "../infrastructure/services/UserServiceClient.js";
import { GetLearningPathKpisUseCase } from "../application/use-cases/GetLearningPathKpisUseCase.js";

import { GetExecutiveDashboardUseCase } from "../application/use-cases/GetExecutiveDashboardUseCase.js";
import { GetTrainingKpisUseCase } from "../application/use-cases/GetTrainingKpisUseCase.js";
import { GetStreamKpisUseCase } from "../application/use-cases/GetStreamKpisUseCase.js";
import { GetAuditSummaryUseCase } from "../application/use-cases/GetAuditSummaryUseCase.js";

import { AnalyticsController } from "../presentation/controllers/AnalyticsController.js";
import { createAnalyticsRoutes } from "../presentation/routes/analyticsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const auditServiceClient = new AuditServiceClient();
const trainingServiceClient = new TrainingServiceClient();
const streamServiceClient = new StreamServiceClient();
const userServiceClient = new UserServiceClient();

const getLearningPathKpisUseCase =
  new GetLearningPathKpisUseCase(
    trainingServiceClient
  );

const getExecutiveDashboardUseCase = new GetExecutiveDashboardUseCase(
  auditServiceClient,
  trainingServiceClient,
  streamServiceClient,
  userServiceClient
);

const getTrainingKpisUseCase = new GetTrainingKpisUseCase(
  trainingServiceClient,
  auditServiceClient
);

const getStreamKpisUseCase = new GetStreamKpisUseCase(
  streamServiceClient,
  auditServiceClient
);

const getAuditSummaryUseCase = new GetAuditSummaryUseCase(auditServiceClient);

const controller = new AnalyticsController(
  getExecutiveDashboardUseCase,
  getTrainingKpisUseCase,
  getStreamKpisUseCase,
  getAuditSummaryUseCase,
  getLearningPathKpisUseCase
);

app.use("/", createAnalyticsRoutes(controller));

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`Analytics Service rodando na porta ${PORT}`);
});