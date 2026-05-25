import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  createCircuitBreakerProxy,
  getCircuitBreakersStatus
} from "./middlewares/circuitBreakerProxy.js";

dotenv.config();

const app = express();

app.use(cors());

app.get("/health", async (req, res) => {
  const services = {
    auth: process.env.AUTH_SERVICE_URL,
    user: process.env.USER_SERVICE_URL,
    communication: process.env.COMMUNICATION_SERVICE_URL,
    stream: process.env.STREAM_SERVICE_URL,
    training: process.env.TRAINING_SERVICE_URL,
    audit: process.env.AUDIT_SERVICE_URL,
    analytics: process.env.ANALYTICS_SERVICE_URL
  };

  const results = {};

  await Promise.all(
    Object.entries(services).map(async ([name, url]) => {
      const startedAt = Date.now();

      try {
        const healthPath =
          name === "training" ? "/trainings/health" : "/health";

        const response = await fetch(`${url}${healthPath}`);

        results[name] = {
          status: response.ok ? "up" : "down",
          responseTimeMs: Date.now() - startedAt,
          statusCode: response.status,
          checkedAt: new Date()
        };
      } catch (error) {
        results[name] = {
          status: "down",
          responseTimeMs: Date.now() - startedAt,
          statusCode: null,
          error: error.message,
          checkedAt: new Date()
        };
      }
    })
  );

  const allUp = Object.values(results).every(
    (service) => service.status === "up"
  );

  res.json({
    status: allUp ? "ok" : "degraded",
    services: results,
    circuits: getCircuitBreakersStatus(),
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  res.send("API Gateway do SICIT rodando");
});

app.get("/circuits", (req, res) => {
  res.json({
    circuits: getCircuitBreakersStatus(),
    timestamp: new Date()
  });
});

app.use(
  "/auth",
  createCircuitBreakerProxy("auth-service", process.env.AUTH_SERVICE_URL, {
    pathRewrite: { "^/auth": "" }
  })
);

app.use(
  "/users",
  createCircuitBreakerProxy("user-service", process.env.USER_SERVICE_URL)
);

app.use(
  "/communication",
  createCircuitBreakerProxy(
    "communication-service",
    process.env.COMMUNICATION_SERVICE_URL
  )
);

app.use(
  "/stream",
  createCircuitBreakerProxy("stream-service", process.env.STREAM_SERVICE_URL)
);

app.use(
  "/training",
  createCircuitBreakerProxy("training-service", process.env.TRAINING_SERVICE_URL)
);

app.use(
  "/audit",
  createCircuitBreakerProxy("audit-service", process.env.AUDIT_SERVICE_URL)
);

app.use(
  "/analytics",
  createCircuitBreakerProxy(
    "analytics-service",
    process.env.ANALYTICS_SERVICE_URL
  )
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gateway rodando na porta ${PORT}`);
});