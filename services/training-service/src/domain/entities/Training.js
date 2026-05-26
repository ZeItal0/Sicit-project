export class Training {
  constructor({ id, title, description, streamId, minAttendancePercent = 70 }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.streamId = streamId;
    this.minAttendancePercent = minAttendancePercent;
    this.createdAt = new Date();
  }
}