export class GetTransmissionsBySectorUseCase {
  constructor(streamRepository) {
    this.streamRepository = streamRepository;
  }

  async execute({ tenantId }) {
    const streams = await this.streamRepository.findEndedByTenantId(tenantId);

    const counter = {};

    for (const stream of streams) {
      if (!stream.sectorId) continue;

      counter[stream.sectorId] = (counter[stream.sectorId] || 0) + 1;
    }

    return Object.entries(counter).map(([sectorId, transmissions]) => ({
      sectorId,
      transmissions,
    }));
  }
}