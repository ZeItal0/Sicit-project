export class GetAuditSummaryUseCase {
  constructor(auditServiceClient) {
    this.auditServiceClient = auditServiceClient;
  }

  async execute({ token }) {
    const events = await this.auditServiceClient.listEvents(token);

    const byAction = {};

    for (const event of events) {
      byAction[event.action] = (byAction[event.action] || 0) + 1;
    }

    return {
      totalEvents: events.length,
      byAction
    };
  }
}