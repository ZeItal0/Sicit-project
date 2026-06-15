export class GetExecutiveDashboardUseCase {
  constructor(auditServiceClient, trainingServiceClient, streamServiceClient, userServiceClient) {
    this.auditServiceClient = auditServiceClient;
    this.trainingServiceClient = trainingServiceClient;
    this.streamServiceClient = streamServiceClient;
    this.userServiceClient = userServiceClient;
  }

  async execute({ token }) {
    const [events, trainings, streams, users] = await Promise.all([
      this.auditServiceClient.listEvents(token),
      this.trainingServiceClient.listTrainings(token),
      this.streamServiceClient.listStreams(token),
      this.userServiceClient.listUsers(token)
    ]);

    const completedTrainingEvents = events.filter(
      (event) => event.action === "TRAINING_RESULTS_GENERATED"
    );

    const certificatesGenerated = events.filter(
      (event) => event.action === "CERTIFICATE_GENERATED"
    );

    const liveStartedEvents = events.filter(
      (event) => event.action === "LIVE_STARTED"
    );

    const viewerJoinedEvents = events.filter(
      (event) => event.action === "VIEWER_JOINED"
    );

    const usersCount = Array.isArray(users) ? users.length : 0;

    return {
      summary: {
        totalUsers: usersCount,
        totalTrainings: trainings.length,
        totalStreams: streams.length,
        totalLivesStarted: liveStartedEvents.length,
        totalViewerJoins: viewerJoinedEvents.length,
        totalCertificatesGenerated: certificatesGenerated.length,
        totalTrainingResultsGenerated: completedTrainingEvents.length,
        totalAuditEvents: events.length
      },
      health: {
        iam: "OK",
        coreBusiness: "OK",
        eventCommunication: "OK",
        dataIntelligence: "OK"
      }
    };
  }
}