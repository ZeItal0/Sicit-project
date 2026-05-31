import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

export function createStreamRoutes(controller) {
  const router = Router();
  const uploadDir = "uploads/recordings";

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".webm";
      cb(null, `${req.params.streamId}-${Date.now()}${ext}`);
    }
  });

  const upload = multer({ storage });

  router.get("/health", (req, res) => { res.json({ service: "stream-service", status: "up", timestamp: new Date() }); });

  router.post("/streams", authMiddleware, controller.create);
  router.get("/streams", authMiddleware, controller.list);
  router.get("/streams/:streamId", authMiddleware, controller.getById);
  router.post("/streams/:streamId/start", authMiddleware, controller.start);
  router.post("/streams/:streamId/end", authMiddleware, controller.end);
  router.post("/streams/:streamId/join", authMiddleware, controller.join);
  router.get("/streams/:streamId/presences", authMiddleware, controller.listPresences);
  router.get("/stats/transmissions-by-sector", authMiddleware, controller.statsBySector);
  router.post("/streams/:streamId/recording", authMiddleware, upload.single("recording"), controller.uploadRecording);
  return router;
}