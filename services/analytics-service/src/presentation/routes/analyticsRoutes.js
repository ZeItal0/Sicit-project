import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export function createAnalyticsRoutes(controller) {
  const router = Router();

  router.get("/health", (req, res) => {res.json({service: "analytics-service",status: "up",timestamp: new Date()});});
  router.get("/dashboard/executive", authMiddleware, controller.executiveDashboard);
  router.get("/kpis/training", authMiddleware, controller.trainingKpis);
  router.get("/kpis/stream", authMiddleware, controller.streamKpis);
  router.get("/audit/summary", authMiddleware, controller.auditSummary);
  router.get("/kpis/learning-paths", authMiddleware, controller.learningPathKpis
);

  return router;
}