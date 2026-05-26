import { LearningPath } from "../../domain/entities/LearningPath.js";

export class CreateLearningPathUseCase {
  constructor(
    learningPathRepository,
    userServiceClient,
    communicationServiceClient,
    moodleServiceClient
  ) {
    this.learningPathRepository = learningPathRepository;
    this.userServiceClient = userServiceClient;
    this.communicationServiceClient = communicationServiceClient;
    this.moodleServiceClient = moodleServiceClient;
  }

  async execute(data) {
    const path = new LearningPath(data);

    const createdPath = await this.learningPathRepository.create(path);

    let moodleSync = null;
    let moodleEnrolments = [];

    if (this.moodleServiceClient) {
      moodleSync =
        await this.moodleServiceClient.createCourseFromLearningPath(createdPath);

      await this.learningPathRepository.updateMoodleSync({
        pathId: createdPath.id,
        moodleCourseId: moodleSync.moodleCourseId,
        moodleShortname: moodleSync.moodleShortname
      });

      if (data.token && createdPath.sectorIds?.length && moodleSync?.moodleCourseId) {
        const users = await this.userServiceClient.listUsers(data.token);

        const targetUsers = users.filter((user) =>
          createdPath.sectorIds.includes(user.sectorId)
        );

        moodleEnrolments = await this.moodleServiceClient.syncUsersAndEnrol({
          users: targetUsers,
          moodleCourseId: moodleSync.moodleCourseId
        });
        
        await this.learningPathRepository.updateMoodleEnrolments({
          pathId: createdPath.id,
          enrolments: moodleEnrolments
        });
      }
    }

    await this.notifyUsersFromSectors({
      token: data.token,
      path: createdPath
    });

    return {
      ...createdPath,
      moodleSync,
      moodleEnrolments
    };
  }

  async notifyUsersFromSectors({ token, path }) {
    if (!token) return;
    if (!path.sectorIds?.length) return;

    const users = await this.userServiceClient.listUsers(token);

    const targetUsers = users.filter((user) =>
      path.sectorIds.includes(user.sectorId)
    );

    for (const user of targetUsers) {
      await this.communicationServiceClient.createNotification({
        token,
        userId: user.id,
        type: "LEARNING_PATH_ASSIGNED",
        content: `Você recebeu uma nova trilha: "${path.title}".`
      });
    }
  }
}