import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { MongoAuditEventRepository } from "../../infrastructure/repositories/MongoAuditEventRepository.js";
import { CreateAuditEventUseCase } from "../../application/use-cases/CreateAuditEventUseCase.js";
import { ListAuditEventsUseCase } from "../../application/use-cases/ListAuditEventsUseCase.js";
import { AuditController } from "../controllers/AuditController.js";

const router = express.Router();

const repository = new MongoAuditEventRepository();

const createAuditEventUseCase = new CreateAuditEventUseCase(repository);
const listAuditEventsUseCase = new ListAuditEventsUseCase(repository);

const controller = new AuditController(
  createAuditEventUseCase,
  listAuditEventsUseCase
);
router.get("/health", (req, res) => {res.json({service: "audit-service",status: "up",timestamp: new Date()});});
router.post("/events", authMiddleware, controller.create);
router.get("/events", authMiddleware, controller.list);

export default router;