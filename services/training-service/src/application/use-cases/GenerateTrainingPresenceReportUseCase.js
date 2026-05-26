export class GenerateTrainingPresenceReportUseCase {
  constructor(trainingRepository, streamServiceClient) {
    this.trainingRepository = trainingRepository;
    this.streamServiceClient = streamServiceClient;
  }

  async execute({ trainingId, token }) {
    if (!trainingId) {
      throw new Error("TrainingId é obrigatório");
    }

    const training = await this.trainingRepository.findById(trainingId);

    if (!training) {
      throw new Error("Treinamento não encontrado");
    }

    const stream = await this.streamServiceClient.getStreamById(
      training.streamId,
      token
    );

    const presences = await this.streamServiceClient.getStreamPresences(
      training.streamId,
      token
    );

    const startedAt = stream.startedAt ? new Date(stream.startedAt) : null;
    const endedAt = stream.endedAt ? new Date(stream.endedAt) : null;

    let streamDurationSeconds = null;

    if (startedAt && endedAt) {
      streamDurationSeconds = Math.floor(
        (endedAt.getTime() - startedAt.getTime()) / 1000
      );
    }

    const groupedByUser = new Map();

    for (const presence of presences) {
      const userId = presence.userId;

      if (!groupedByUser.has(userId)) {
        groupedByUser.set(userId, {
          userId,
          email: presence.email,
          role: presence.role,
          watchedSeconds: 0,
          sessions: []
        });
      }

      const item = groupedByUser.get(userId);

      item.watchedSeconds += presence.durationSeconds || 0;

      item.sessions.push({
        joinedAt: presence.joinedAt,
        leftAt: presence.leftAt,
        durationSeconds: presence.durationSeconds || 0
      });
    }

    const report = Array.from(groupedByUser.values()).map((user) => {
      let attendancePercent = streamDurationSeconds
        ? Math.round((user.watchedSeconds / streamDurationSeconds) * 100)
        : null;

      if (attendancePercent !== null) {
        attendancePercent = Math.min(attendancePercent, 100);
      }

      const status =
        attendancePercent !== null &&
        attendancePercent >= training.minAttendancePercent
          ? "COMPLETED"
          : "NOT_COMPLETED";

      return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        watchedSeconds: user.watchedSeconds,
        attendancePercent,
        requiredPercent: training.minAttendancePercent,
        status,
        sessions: user.sessions
      };
    });

    return {
      training: {
        id: training.id,
        title: training.title,
        description: training.description,
        streamId: training.streamId,
        minAttendancePercent: training.minAttendancePercent
      },
      stream: {
        id: stream.id,
        title: stream.title,
        status: stream.status,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
        durationSeconds: streamDurationSeconds
      },
      report
    };
  }
}