export class StreamPresenceRepository {
  async startPresence(_data) {
    throw new Error("Método startPresence precisa ser implementado");
  }

  async endPresence(_data) {
    throw new Error("Método endPresence precisa ser implementado");
  }

  async findByStreamId(_streamId) {
    throw new Error("Método findByStreamId precisa ser implementado");
  }
}