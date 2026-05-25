import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

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
    timestamp: new Date()
  });
});

function createServiceProxy(serviceName, target, extraOptions = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 5000,
    proxyTimeout: 5000,
    ...extraOptions,
    on: {
      error(err, req, res) {
        if (!res.headersSent) {
          res.status(503).json({
            message: `${serviceName} indisponível no momento`
          });
        }
      }
    }
  });
}

app.get("/", (req, res) => { res.send("API Gateway do SICIT rodando"); });

app.use("/auth", createServiceProxy("auth-service", process.env.AUTH_SERVICE_URL, { pathRewrite: { "^/auth": "" } }));

app.use("/users", createServiceProxy("user-service", process.env.USER_SERVICE_URL));
app.use("/communication", createServiceProxy("communication-service", process.env.COMMUNICATION_SERVICE_URL));
app.use("/stream", createServiceProxy("stream-service", process.env.STREAM_SERVICE_URL));
app.use("/training", createServiceProxy("training-service", process.env.TRAINING_SERVICE_URL));
app.use("/audit", createServiceProxy("audit-service", process.env.AUDIT_SERVICE_URL));
app.use("/analytics", createServiceProxy("analytics-service", process.env.ANALYTICS_SERVICE_URL));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gateway rodando na porta ${PORT}`);
});