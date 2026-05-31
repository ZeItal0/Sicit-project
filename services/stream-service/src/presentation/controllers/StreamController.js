export class StreamController {
  constructor(
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
  ) {
    this.createStreamSessionUseCase = createStreamSessionUseCase;
    this.listStreamSessionsUseCase = listStreamSessionsUseCase;
    this.getStreamSessionByIdUseCase = getStreamSessionByIdUseCase;
    this.startStreamSessionUseCase = startStreamSessionUseCase;
    this.endStreamSessionUseCase = endStreamSessionUseCase;
    this.joinStreamSessionUseCase = joinStreamSessionUseCase;
    this.listStreamPresencesUseCase = listStreamPresencesUseCase;
    this.registerAuditEventUseCase = registerAuditEventUseCase;
    this.communicationServiceClient = communicationServiceClient;
    this.getTransmissionsBySectorUseCase = getTransmissionsBySectorUseCase;
    this.saveStreamRecordingUseCase = saveStreamRecordingUseCase;
  }

  create = async (req, res) => {
    try {
      const result = await this.createStreamSessionUseCase.execute({
        tenantId: req.user.tenantId,
        hostId: req.user.id,
        token: req.headers.authorization?.split(" ")[1],
        ...req.body
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  list = async (req, res) => {
    try {
      const result = await this.listStreamSessionsUseCase.execute({
        tenantId: req.user.tenantId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const result = await this.getStreamSessionByIdUseCase.execute({
        streamId: req.params.streamId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  };

  start = async (req, res) => {
    try {
      const result = await this.startStreamSessionUseCase.execute({
        streamId: req.params.streamId,
        userId: req.user.id
      });

      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "LIVE_STARTED",
        resourceType: "STREAM",
        resourceId: req.params.streamId,
        metadata: {
          hostId: req.user.id,
          title: result.title,
          startedAt: result.startedAt
        }
      });

      await this.communicationServiceClient.createNotification({
        token: req.headers.authorization?.split(" ")[1],
        userId: req.user.id,
        type: "LIVE_STARTED",
        content: `A live "${result.title}" foi iniciada com sucesso.`
      });

      return res.status(200).json({
        ...result,
        audit
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  end = async (req, res) => {
    try {
      const result = await this.endStreamSessionUseCase.execute({
        streamId: req.params.streamId,
        userId: req.user.id
      });

      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "LIVE_ENDED",
        resourceType: "STREAM",
        resourceId: req.params.streamId,
        metadata: {
          hostId: req.user.id,
          title: result.title,
          startedAt: result.startedAt,
          endedAt: result.endedAt
        }
      });

      return res.status(200).json({
        ...result,
        audit
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  join = async (req, res) => {
    try {
      const result = await this.joinStreamSessionUseCase.execute({
        tenantId: req.user.tenantId,
        streamId: req.params.streamId,
        userId: req.user.id,
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listPresences = async (req, res) => {
    try {
      const result = await this.listStreamPresencesUseCase.execute({
        streamId: req.params.streamId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  statsBySector =
    async (req, res) => {
      try {
        const result = await this.getTransmissionsBySectorUseCase.execute({
          tenantId: req.user.tenantId,
          token: req.headers.authorization?.split(" ")[1]
        });

        return res.status(200).json(result);
      }
      catch (
      error
      ) {
        return res.status(400).json({ message: error.message });
      }
    };

  uploadRecording = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Arquivo da gravação não enviado"
        });
      }

      const recordingUrl = `${req.protocol}://${req.get("host")}/uploads/recordings/${req.file.filename}`;

      const result = await this.saveStreamRecordingUseCase.execute({
        streamId: req.params.streamId,
        userId: req.user.id,
        recordingUrl
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  };
}