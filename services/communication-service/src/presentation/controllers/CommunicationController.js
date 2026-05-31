export class CommunicationController {
  constructor(
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
  ) {
    this.createChannelUseCase = createChannelUseCase;
    this.listChannelsUseCase = listChannelsUseCase;
    this.joinChannelUseCase = joinChannelUseCase;
    this.sendMessageUseCase = sendMessageUseCase;
    this.listMessagesUseCase = listMessagesUseCase;
    this.markMessageAsReadUseCase = markMessageAsReadUseCase;
    this.listMessageReadsUseCase = listMessageReadsUseCase;
    this.getUserPresenceUseCase = getUserPresenceUseCase;
    this.createDirectChannelUseCase = createDirectChannelUseCase;
    this.listDirectChannelsUseCase = listDirectChannelsUseCase;
    this.listDirectChannelsDetailedUseCase = listDirectChannelsDetailedUseCase;
    this.listNotificationsUseCase = listNotificationsUseCase;
    this.markNotificationAsReadUseCase = markNotificationAsReadUseCase;
    this.getUnreadNotificationCountUseCase = getUnreadNotificationCountUseCase;
    this.registerAuditEventUseCase = registerAuditEventUseCase;
    this.createNotificationUseCase = createNotificationUseCase;
    this.listPresenceUseCase = listPresenceUseCase;
  }

  createChannel = async (req, res) => {
    try {
      const result = await this.createChannelUseCase.execute({
        tenantId: req.user.tenantId,
        createdBy: req.user.id,
        ...req.body
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "CHANNEL_CREATED",
        resourceType: "COMMUNICATION_CHANNEL",
        resourceId: result.id,
        metadata: {
          createdBy: req.user.id,
          name: result.name,
          type: result.type
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listChannels = async (req, res) => {
    try {
      const result = await this.listChannelsUseCase.execute({
        tenantId: req.user.tenantId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  joinChannel = async (req, res) => {
    try {
      const result = await this.joinChannelUseCase.execute({
        tenantId: req.user.tenantId,
        channelId: req.params.channelId,
        userId: req.user.id
      });

      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "MEMBER_JOINED_CHANNEL",
        resourceType: "COMMUNICATION_CHANNEL",
        resourceId: req.params.channelId,
        metadata: {
          userId: req.user.id
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createNotification = async (req, res) => {
    try {
      const result = await this.createNotificationUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.body.userId,
        type: req.body.type,
        content: req.body.content,
        channelId: req.body.channelId || null,
        messageId: req.body.messageId || null,
        senderId: req.user.id
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  sendMessage = async (req, res) => {
    try {
      const result = await this.sendMessageUseCase.execute({
        tenantId: req.user.tenantId,
        channelId: req.params.channelId,
        senderId: req.user.id,
        content: req.body.content
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listMessages = async (req, res) => {
    try {
      const result = await this.listMessagesUseCase.execute({
        channelId: req.params.channelId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  markMessageAsRead = async (req, res) => {
    try {
      const result = await this.markMessageAsReadUseCase.execute({
        tenantId: req.user.tenantId,
        channelId: req.params.channelId,
        messageId: req.params.messageId,
        userId: req.user.id
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listMessageReads = async (req, res) => {
    try {
      const result = await this.listMessageReadsUseCase.execute({
        messageId: req.params.messageId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getUserPresence = async (req, res) => {
    try {
      const result = await this.getUserPresenceUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.params.userId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createDirectChannel = async (req, res) => {
    try {
      const result = await this.createDirectChannelUseCase.execute({
        tenantId: req.user.tenantId,
        currentUserId: req.user.id,
        targetUserId: req.body.targetUserId
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "DIRECT_CHANNEL_CREATED",
        resourceType: "DIRECT_CHANNEL",
        resourceId: result.id,
        metadata: {
          currentUserId: req.user.id,
          targetUserId: req.body.targetUserId
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listDirectChannels = async (req, res) => {
    try {
      const result = await this.listDirectChannelsUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listDirectChannelsDetailed = async (req, res) => {
    try {
      const result = await this.listDirectChannelsDetailedUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listNotifications = async (req, res) => {
    try {
      const result = await this.listNotificationsUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  markNotificationAsRead = async (req, res) => {
    try {
      const result = await this.markNotificationAsReadUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        notificationId: req.params.notificationId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getUnreadNotificationCount = async (req, res) => {
    try {
      const result = await this.getUnreadNotificationCountUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listPresence = async (req, res) => {
    try {
      const result = await this.listPresenceUseCase.execute({
        tenantId: req.user.tenantId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}