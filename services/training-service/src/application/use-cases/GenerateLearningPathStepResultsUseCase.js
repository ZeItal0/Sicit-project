import { LearningPathStepResult } from "../../domain/entities/LearningPathStepResult.js";

export class GenerateLearningPathStepResultsUseCase {
  constructor(
    learningPathRepository,
    learningPathStepResultRepository,
    learningPathResultRepository,
    streamServiceClient,
    communicationServiceClient,
    moodleServiceClient
  ) {
    this.learningPathRepository = learningPathRepository;
    this.learningPathStepResultRepository = learningPathStepResultRepository;
    this.learningPathResultRepository = learningPathResultRepository;
    this.streamServiceClient = streamServiceClient;
    this.communicationServiceClient = communicationServiceClient;
    this.moodleServiceClient = moodleServiceClient;
  }

  async execute({ tenantId, pathId, stepId, token }) {
    if (!tenantId || !pathId || !stepId || !token) {
      throw new Error(
        "tenantId, pathId, stepId e token são obrigatórios"
      );
    }

    const path =
      await this.learningPathRepository.findById(pathId);

    if (!path) {
      throw new Error("Trilha não encontrada");
    }

    if (path.tenantId !== tenantId) {
      throw new Error("Trilha não pertence a este tenant");
    }

    const step = path.steps.find(
      (item) => item.id === stepId
    );

    if (!step) {
      throw new Error("Etapa não encontrada");
    }

    if (!step.streamId) {
      throw new Error(
        "Etapa ainda não possui live vinculada"
      );
    }

    const stream =
      await this.streamServiceClient.getStreamById(
        step.streamId,
        token
      );

    const presences =
      await this.streamServiceClient.getStreamPresences(
        step.streamId,
        token
      );

    const startedAt = stream.startedAt
      ? new Date(stream.startedAt)
      : null;

    const endedAt = stream.endedAt
      ? new Date(stream.endedAt)
      : null;

    if (!startedAt || !endedAt) {
      throw new Error(
        "Live precisa estar encerrada para calcular resultado"
      );
    }

    const streamDurationSeconds = Math.max(
      1,
      Math.floor(
        (endedAt.getTime() - startedAt.getTime()) / 1000
      )
    );

    const groupedByUser = new Map();

    for (const presence of presences) {
      if (!presence.userId) continue;

      if (!groupedByUser.has(presence.userId)) {
        groupedByUser.set(presence.userId, {
          userId: presence.userId,
          userName:
            presence.userName ||
            presence.email ||
            presence.userId,

          email: presence.email,

          watchedSeconds: 0,

          sessions: []
        });
      }

      const userPresence =
        groupedByUser.get(presence.userId);

      let durationSeconds = Number(
        presence.durationSeconds || 0
      );

      if (!durationSeconds && presence.joinedAt) {
        const joinedAt = new Date(presence.joinedAt);

        const leftAt = presence.leftAt
          ? new Date(presence.leftAt)
          : endedAt;

        durationSeconds = Math.max(
          0,
          Math.floor(
            (leftAt.getTime() - joinedAt.getTime()) / 1000
          )
        );
      }

      durationSeconds = Math.min(
        durationSeconds,
        streamDurationSeconds
      );

      userPresence.watchedSeconds += durationSeconds;

      userPresence.sessions.push({
        joinedAt: presence.joinedAt,
        leftAt: presence.leftAt || endedAt,
        durationSeconds
      });
    }

    const results = [];

    for (const userPresence of groupedByUser.values()) {
      const watchedSeconds = Math.min(
        userPresence.watchedSeconds,
        streamDurationSeconds
      );

      const attendancePercent = Math.min(
        100,
        Math.round(
          (watchedSeconds / streamDurationSeconds) * 100
        )
      );

      const approved =
        attendancePercent >=
        Number(step.requiredPercent || 80);

      const result = new LearningPathStepResult({
        tenantId,

        pathId,
        stepId,

        streamId: step.streamId,

        userId: userPresence.userId,
        userName: userPresence.userName,

        attendancePercent,

        requiredPercent: Number(
          step.requiredPercent || 80
        ),

        approved,

        completedAt: approved ? new Date() : null
      });

      result.email = userPresence.email;

      result.watchedSeconds = watchedSeconds;

      result.streamDurationSeconds =
        streamDurationSeconds;

      result.sessions = userPresence.sessions;

      await this.learningPathStepResultRepository.upsert(
        result
      );
      if (this.moodleServiceClient && path.moodleCourseId && path.moodleEnrolments?.length) {
        const enrolment = path.moodleEnrolments.find(
          (item) => item.sicitUserId === userPresence.userId
        );

        if (enrolment?.moodleUserId) {
          await this.moodleServiceClient.addCourseNote({
            moodleUserId: enrolment.moodleUserId,
            moodleCourseId: path.moodleCourseId,
            text: `SICIT: etapa "${step.title}" concluída. Presença: ${attendancePercent}%. Tempo assistido: ${watchedSeconds}s de ${streamDurationSeconds}s. Status: ${approved ? "Aprovado" : "Não aprovado"
              }.`
          });

          await this.learningPathStepResultRepository.markMoodleSynced({
            pathId,
            stepId,
            userId: userPresence.userId,
            moodleNoteSyncedAt: new Date()
          });
        }
      }

      await this.updateLearningPathProgress({
        tenantId,
        path,
        userId: userPresence.userId,
        token
      });

      results.push(result);
    }

    return {
      pathId,
      stepId,

      streamId: step.streamId,

      streamDurationSeconds,

      generatedResults: results.length,

      approvedCount:
        results.filter((item) => item.approved).length,

      results
    };
  }

  async updateLearningPathProgress({
    tenantId,
    path,
    userId,
    token
  }) {
    const allStepResults =
      await this.learningPathStepResultRepository.findByUserId(
        userId
      );

    const pathStepIds = path.steps.map(
      (step) => step.id
    );

    const completedStepResults =
      allStepResults.filter(
        (result) =>
          result.pathId === path.id &&
          pathStepIds.includes(result.stepId) &&
          result.approved === true
      );

    const totalSteps = path.steps.length;

    const completedSteps =
      completedStepResults.length;

    const completionPercent =
      totalSteps > 0
        ? Math.round(
          (completedSteps / totalSteps) * 100
        )
        : 0;

    const approved =
      completionPercent >=
      Number(path.minCompletionPercent || 100);

    const existing =
      await this.learningPathResultRepository.findByUserIdAndPathId(
        userId,
        path.id
      );

    const progressData = {
      tenantId,

      userId,

      userName: completedStepResults[0]?.userName || userId,
      email: completedStepResults[0]?.email || "",

      pathId: path.id,

      completedTrainings: completedSteps,

      totalTrainings: totalSteps,

      completionPercent,

      approved,

      generatedAt: new Date()
    };

    let savedResult;

    if (existing) {
      savedResult = await this.learningPathResultRepository.update(
        existing.id,
        progressData
      );
    } else {
      savedResult = await this.learningPathResultRepository.create(
        progressData
      );
    }

    const wasAlreadyApproved = existing?.approved === true;

    if (
      progressData.approved === true &&
      !wasAlreadyApproved &&
      this.communicationServiceClient &&
      token
    ) {
      await this.communicationServiceClient.createNotification({
        token,
        userId,
        type: "CERTIFICATE_AVAILABLE",
        content: `Seu certificado da trilha "${path.title}" está disponível para download.`
      });
    }
    if (
      this.moodleServiceClient &&
      path.moodleCourseId &&
      path.moodleEnrolments?.length
    ) {

      const enrolment =
        path.moodleEnrolments.find(
          (
            item
          ) =>
            item.sicitUserId ===
            userId
        );

      if (
        enrolment
      ) {

        const moodleProgress =
          await this.moodleServiceClient
            .getCourseCompletion({
              moodleUserId:
                enrolment.moodleUserId,

              moodleCourseId:
                path.moodleCourseId
            });

        await this.learningPathResultRepository
          .updateMoodleProgress({
            pathId:
              path.id,

            userId,

            moodleProgress
          });
      }
    }
    return savedResult;
  }
}