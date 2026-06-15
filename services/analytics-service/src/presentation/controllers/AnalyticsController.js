export class AnalyticsController {
  constructor(
    getExecutiveDashboardUseCase,
    getTrainingKpisUseCase,
    getStreamKpisUseCase,
    getAuditSummaryUseCase,
    getLearningPathKpisUseCase
  ) {
    this.getExecutiveDashboardUseCase = getExecutiveDashboardUseCase;
    this.getTrainingKpisUseCase = getTrainingKpisUseCase;
    this.getStreamKpisUseCase = getStreamKpisUseCase;
    this.getAuditSummaryUseCase = getAuditSummaryUseCase;
    this.getLearningPathKpisUseCase = getLearningPathKpisUseCase;
  }

  executiveDashboard = async (req, res) => {
    try {
      const result = await this.getExecutiveDashboardUseCase.execute({
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  learningPathKpis = async (req, res) => {
    try {
      const result =
        await this.getLearningPathKpisUseCase.execute({
          token: req.headers.authorization?.split(" ")[1]
        });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  };

  trainingKpis = async (req, res) => {
    try {
      const result = await this.getTrainingKpisUseCase.execute({
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  streamKpis = async (req, res) => {
    try {
      const result = await this.getStreamKpisUseCase.execute({
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  auditSummary = async (req, res) => {
    try {
      const result = await this.getAuditSummaryUseCase.execute({
        token: req.headers.authorization?.split(" ")[1]
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}