import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { validateBody } from "../../middlewares/validateBody.js";
import { sendMessageSchema, createChannelSchema, createDirectChannelSchema, } from "../validators/communicationSchemas.js";

export function createCommunicationRoutes(controller) {
  const router = Router();

  router.get("/health", (req, res) => { res.json({ service: "comunication-service", status: "up", timestamp: new Date() }); });

  router.post("/channels", authMiddleware, validateBody(createChannelSchema), controller.createChannel);
  router.get("/channels", authMiddleware, controller.listChannels);
  router.post("/channels/:channelId/join", authMiddleware, controller.joinChannel);

  router.post("/direct-channels", authMiddleware, validateBody(createDirectChannelSchema), controller.createDirectChannel);
  router.get("/direct-channels", authMiddleware, controller.listDirectChannels);
  router.get("/direct-channels/detailed", authMiddleware, controller.listDirectChannelsDetailed);

  router.post("/channels/:channelId/join", authMiddleware, controller.joinChannel);
  router.post("/channels/:channelId/messages", authMiddleware, validateBody(sendMessageSchema), controller.sendMessage);
  router.get("/channels/:channelId/messages", authMiddleware, controller.listMessages);

  router.post("/channels/:channelId/messages/:messageId/read", authMiddleware, controller.markMessageAsRead);
  router.get("/channels/:channelId/messages/:messageId/reads", authMiddleware, controller.listMessageReads);

  router.post("/notifications", authMiddleware, controller.createNotification);
  router.get("/notifications", authMiddleware, controller.listNotifications);
  router.patch("/notifications/:notificationId/read", authMiddleware, controller.markNotificationAsRead);
  router.get("/notifications/unread-count", authMiddleware, controller.getUnreadNotificationCount);

  router.get("/presence", authMiddleware, controller.listPresence);
  router.get("/presence/:userId", authMiddleware, controller.getUserPresence);
  return router;
}