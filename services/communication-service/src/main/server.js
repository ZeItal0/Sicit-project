import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { MongoChannelRepository } from "../infrastructure/repositories/MongoChannelRepository.js";
import { MongoChannelMemberRepository } from "../infrastructure/repositories/MongoChannelMemberRepository.js";
import { MongoMessageRepository } from "../infrastructure/repositories/MongoMessageRepository.js";
import { MongoMessageReadRepository } from "../infrastructure/repositories/MongoMessageReadRepository.js";
import { publishMessageCreated } from "../infrastructure/messaging/rabbitmq.js";

import { AuditServiceClient } from "../infrastructure/services/AuditServiceClient.js";
import { RegisterAuditEventUseCase } from "../application/use-cases/RegisterAuditEventUseCase.js";

import { MongoNotificationRepository } from "../infrastructure/repositories/MongoNotificationRepository.js";
import { ListNotificationsUseCase } from "../application/use-cases/ListNotificationsUseCase.js";
import { MarkNotificationAsReadUseCase } from "../application/use-cases/MarkNotificationAsReadUseCase.js";
import { GetUnreadNotificationCountUseCase } from "../application/use-cases/GetUnreadNotificationCountUseCase.js";
import { getRabbitChannel } from "../infrastructure/messaging/rabbitmq.js";

import { CreateDirectChannelUseCase } from "../application/use-cases/CreateDirectChannelUseCase.js";
import { ListDirectChannelsUseCase } from "../application/use-cases/ListDirectChannelsUseCase.js";
import { ListDirectChannelsDetailedUseCase } from "../application/use-cases/ListDirectChannelsDetailedUseCase.js";

import { UserServiceClient } from "../infrastructure/services/UserServiceClient.js";

import { startNotificationConsumer } from "../infrastructure/messaging/notificationConsumer.js";

import { MongoPresenceRepository } from "../infrastructure/repositories/MongoPresenceRepository.js";
import { SetUserOnlineUseCase } from "../application/use-cases/SetUserOnlineUseCase.js";
import { SetUserOfflineUseCase } from "../application/use-cases/SetUserOfflineUseCase.js";
import { GetUserPresenceUseCase } from "../application/use-cases/GetUserPresenceUseCase.js";
import { emitUserOnline, emitUserOffline } from "../presentation/sockets/presenceSocketPublisher.js";

import { CreateChannelUseCase } from "../application/use-cases/CreateChannelUseCase.js";
import { ListChannelsUseCase } from "../application/use-cases/ListChannelsUseCase.js";
import { JoinChannelUseCase } from "../application/use-cases/JoinChannelUseCase.js";
import { SendMessageUseCase } from "../application/use-cases/SendMessageUseCase.js";
import { ListMessagesUseCase } from "../application/use-cases/ListMessagesUseCase.js";
import { MarkMessageAsReadUseCase } from "../application/use-cases/MarkMessageAsReadUseCase.js";
import { ListMessageReadsUseCase } from "../application/use-cases/ListMessageReadsUseCase.js";

import { CommunicationController } from "../presentation/controllers/CommunicationController.js";
import { createCommunicationRoutes } from "../presentation/routes/communicationRoutes.js";
import { registerCommunicationSocket } from "../presentation/sockets/communicationSocket.js";
import { setSocketServer } from "../presentation/sockets/socketServer.js";
import { emitMessageCreated } from "../presentation/sockets/messageSocketPublisher.js";
import { emitMessageRead } from "../presentation/sockets/messageReadSocketPublisher.js";

import { CreateNotificationUseCase } from "../application/use-cases/CreateNotificationUseCase.js";
import { emitNotificationToUser } from "../presentation/sockets/notificationSocketPublisher.js";

import { ListPresenceUseCase } from "../application/use-cases/ListPresenceUseCase.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  path: "/communication-socket",
  cors: {
    origin: "*",
  },

  pingInterval: 120000,
  pingTimeout: 30000,
});

app.use(cors());
app.use(express.json());

setSocketServer(io);

const channelRepository = new MongoChannelRepository();
const channelMemberRepository = new MongoChannelMemberRepository();
const messageRepository = new MongoMessageRepository();
const messageReadRepository = new MongoMessageReadRepository();

const notificationRepository = new MongoNotificationRepository();

const listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
const getUnreadNotificationCountUseCase = new GetUnreadNotificationCountUseCase(notificationRepository);

const presenceRepository = new MongoPresenceRepository();

const userServiceClient = new UserServiceClient();

const setUserOnlineUseCase = new SetUserOnlineUseCase(presenceRepository);
const setUserOfflineUseCase = new SetUserOfflineUseCase(presenceRepository);
const getUserPresenceUseCase = new GetUserPresenceUseCase(presenceRepository);

const createDirectChannelUseCase = new CreateDirectChannelUseCase(
  channelRepository,
  channelMemberRepository
);

const listPresenceUseCase = new ListPresenceUseCase(presenceRepository);

const listDirectChannelsUseCase = new ListDirectChannelsUseCase(
  channelRepository,
  channelMemberRepository
);

const createChannelUseCase = new CreateChannelUseCase(
  channelRepository,
  channelMemberRepository
);

const listChannelsUseCase = new ListChannelsUseCase(channelRepository);

const joinChannelUseCase = new JoinChannelUseCase(
  channelRepository,
  channelMemberRepository
);

const createNotificationUseCase = new CreateNotificationUseCase(
  notificationRepository,
  emitNotificationToUser
);


const sendMessageUseCase = new SendMessageUseCase(
  messageRepository,
  channelMemberRepository,
  publishMessageCreated,
  emitMessageCreated
);

const auditServiceClient = new AuditServiceClient();

const registerAuditEventUseCase = new RegisterAuditEventUseCase(
  auditServiceClient
);

const listDirectChannelsDetailedUseCase = new ListDirectChannelsDetailedUseCase(
  channelRepository,
  channelMemberRepository,
  messageRepository,
  presenceRepository,
  userServiceClient,
  messageReadRepository
);
const listMessagesUseCase = new ListMessagesUseCase(messageRepository);

const markMessageAsReadUseCase = new MarkMessageAsReadUseCase(
  messageReadRepository,
  channelMemberRepository,
  emitMessageRead
);

const listMessageReadsUseCase = new ListMessageReadsUseCase(
  messageReadRepository
);

const controller = new CommunicationController(
  createChannelUseCase,
  listChannelsUseCase,
  joinChannelUseCase,
  sendMessageUseCase,
  listMessagesUseCase,
  markMessageAsReadUseCase,
  listMessageReadsUseCase,
  getUserPresenceUseCase,
  createDirectChannelUseCase,
  listDirectChannelsUseCase,
  listDirectChannelsDetailedUseCase,
  listNotificationsUseCase,
  markNotificationAsReadUseCase,
  getUnreadNotificationCountUseCase,
  registerAuditEventUseCase,
  createNotificationUseCase,
  listPresenceUseCase
);

app.use("/", createCommunicationRoutes(controller));

const rabbitChannel = await getRabbitChannel();

registerCommunicationSocket(
  io,
  setUserOnlineUseCase,
  setUserOfflineUseCase,
  emitUserOnline,
  emitUserOffline
);

await startNotificationConsumer(
  rabbitChannel,
  channelMemberRepository,
  notificationRepository
);

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Communication Service rodando na porta ${PORT}`);
});