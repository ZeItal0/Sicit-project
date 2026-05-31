import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { MongoStreamSessionRepository } from "../infrastructure/repositories/MongoStreamSessionRepository.js";
import { MongoStreamParticipantRepository } from "../infrastructure/repositories/MongoStreamParticipantRepository.js";

import { MongoStreamPresenceRepository } from "../infrastructure/repositories/MongoStreamPresenceRepository.js";
import { ListStreamPresencesUseCase } from "../application/use-cases/ListStreamPresencesUseCase.js";

import { CommunicationServiceClient } from "../infrastructure/services/CommunicationServiceClient.js";

import { SaveStreamRecordingUseCase } from "../application/use-cases/SaveStreamRecordingUseCase.js";

import { CreateStreamSessionUseCase } from "../application/use-cases/CreateStreamSessionUseCase.js";
import { ListStreamSessionsUseCase } from "../application/use-cases/ListStreamSessionsUseCase.js";
import { GetStreamSessionByIdUseCase } from "../application/use-cases/GetStreamSessionByIdUseCase.js";
import { StartStreamSessionUseCase } from "../application/use-cases/StartStreamSessionUseCase.js";
import { EndStreamSessionUseCase } from "../application/use-cases/EndStreamSessionUseCase.js";
import { JoinStreamSessionUseCase } from "../application/use-cases/JoinStreamSessionUseCase.js";

import { StreamController } from "../presentation/controllers/StreamController.js";
import { createStreamRoutes } from "../presentation/routes/streamRoutes.js";
import { registerStreamSocket } from "../presentation/sockets/streamSocket.js";

import { AuditServiceClient } from "../infrastructure/services/AuditServiceClient.js";
import { RegisterAuditEventUseCase } from "../application/use-cases/RegisterAuditEventUseCase.js";

import { UserServiceClient } from "../infrastructure/services/UserServiceClient.js";

import { GetTransmissionsBySectorUseCase } from "../application/use-cases/GetTransmissionsBySectorUseCase.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  path: "/stream-socket",
  cors: {
    origin: "*",
  },

  pingInterval: 120000,
  pingTimeout: 30000,
});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const streamSessionRepository = new MongoStreamSessionRepository();
const streamParticipantRepository = new MongoStreamParticipantRepository();

const auditServiceClient = new AuditServiceClient();

const registerAuditEventUseCase = new RegisterAuditEventUseCase(
  auditServiceClient
);

const streamPresenceRepository = new MongoStreamPresenceRepository();

const listStreamPresencesUseCase = new ListStreamPresencesUseCase(
  streamPresenceRepository
);

const saveStreamRecordingUseCase =
  new SaveStreamRecordingUseCase(streamSessionRepository);

const listStreamSessionsUseCase = new ListStreamSessionsUseCase(
  streamSessionRepository
);

const getStreamSessionByIdUseCase = new GetStreamSessionByIdUseCase(
  streamSessionRepository,
  streamParticipantRepository
);

const startStreamSessionUseCase = new StartStreamSessionUseCase(
  streamSessionRepository
);

const communicationServiceClient = new CommunicationServiceClient();

const endStreamSessionUseCase = new EndStreamSessionUseCase(
  streamSessionRepository
);

const joinStreamSessionUseCase = new JoinStreamSessionUseCase(
  streamSessionRepository,
  streamParticipantRepository,
  communicationServiceClient
);

const createStreamSessionUseCase = new CreateStreamSessionUseCase(
  streamSessionRepository,
  streamParticipantRepository,
  communicationServiceClient
);

const userServiceClient = new UserServiceClient();

const getTransmissionsBySectorUseCase = new GetTransmissionsBySectorUseCase(streamSessionRepository);

const controller = new StreamController(
  createStreamSessionUseCase,
  listStreamSessionsUseCase,
  getStreamSessionByIdUseCase,
  startStreamSessionUseCase,
  endStreamSessionUseCase,
  joinStreamSessionUseCase,
  listStreamPresencesUseCase,
  registerAuditEventUseCase,
  communicationServiceClient,
  getTransmissionsBySectorUseCase,
  saveStreamRecordingUseCase
);

app.use("/", createStreamRoutes(controller));

registerStreamSocket(io, streamPresenceRepository);

const PORT = process.env.PORT || 3004;

server.listen(PORT, () => {
  console.log(`Stream Service rodando na porta ${PORT}`);
});