export class AuditController {
  constructor(createAuditEventUseCase, listAuditEventsUseCase) {
    this.createAuditEventUseCase = createAuditEventUseCase;
    this.listAuditEventsUseCase = listAuditEventsUseCase;
  }

  create = async (req, res) => {
    try {
      const event = await this.createAuditEventUseCase.execute({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        userEmail: req.user.email,
        ...req.body
      });

      return res.status(201).json(event);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };

  list = async (req, res) => {
    try {
      const events = await this.listAuditEventsUseCase.execute({
        tenantId: req.user.tenantId,
        ...req.query
      });

      return res.status(200).json(events);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}