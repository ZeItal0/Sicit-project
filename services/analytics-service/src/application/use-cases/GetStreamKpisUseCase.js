export class GetStreamKpisUseCase {
  constructor(streamServiceClient, auditServiceClient) {
    this.streamServiceClient = streamServiceClient;
    this.auditServiceClient = auditServiceClient;
  }

  async execute({ token }) {
    const [streams, events] = await Promise.all([
      this.streamServiceClient.listStreams(token),
      this.auditServiceClient.listEvents(token)
    ]);

    const liveStarted = events.filter((event) => event.action === "LIVE_STARTED");
    const liveEnded = events.filter((event) => event.action === "LIVE_ENDED");
    const viewerJoined = events.filter((event) => event.action === "VIEWER_JOINED");
    const viewerLeft = events.filter((event) => event.action === "VIEWER_LEFT");

    const endedStreams = streams.filter((stream) => stream.status === "ended");

    return {
      totalStreams: streams.length,
      scheduledStreams: streams.filter((stream) => stream.status === "scheduled").length,
      liveStreams: streams.filter((stream) => stream.status === "live").length,
      endedStreams: endedStreams.length,
      liveStartedEvents: liveStarted.length,
      liveEndedEvents: liveEnded.length,
      viewerJoinedEvents: viewerJoined.length,
      viewerLeftEvents: viewerLeft.length
    };
  }
}