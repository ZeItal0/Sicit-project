export class TrainingResult {
  constructor({
    id,
    trainingId,
    userId,
    email,
    attendancePercent,
    watchedSeconds,
    requiredPercent,
    status,
    approved,
    generatedAt = new Date()
  }) {
    this.id = id;
    this.trainingId = trainingId;
    this.userId = userId;
    this.email = email;
    this.attendancePercent = attendancePercent;
    this.watchedSeconds = watchedSeconds;
    this.requiredPercent = requiredPercent;
    this.status = status;
    this.approved = approved;
    this.generatedAt = generatedAt;
  }
}