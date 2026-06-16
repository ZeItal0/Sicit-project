export class ListAuditEventsUseCase {
  constructor(auditEventRepository) {
    this.auditEventRepository = auditEventRepository;
  }

  async execute(filters) {
    return this.auditEventRepository.findAll(filters);
  }
}