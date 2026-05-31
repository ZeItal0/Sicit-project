export class StreamParticipantRepository {
  async create(_data) {
    throw new Error("Método create precisa ser implementado");
  }

  async findByStreamId(_streamId) {
    throw new Error("Método findByStreamId precisa ser implementado");
  }

  async findByStreamIdAndUserId(_streamId, _userId) {
    throw new Error("Método findByStreamIdAndUserId precisa ser implementado");
  }
}