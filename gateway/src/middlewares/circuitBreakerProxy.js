import CircuitBreaker from "opossum";
import { createProxyMiddleware } from "http-proxy-middleware";

const breakers = new Map();

function getBreaker(serviceName, proxyMiddleware) {
  if (breakers.has(serviceName)) {
    return breakers.get(serviceName);
  }

  const breaker = new CircuitBreaker(
    (req, res, next) => {
      return new Promise((resolve, reject) => {
        req.__circuitResolve = resolve;
        req.__circuitReject = reject;

        proxyMiddleware(req, res, next);
      });
    },
    {
      name: serviceName,
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10
    }
  );

  breaker.on("open", () => {
    console.log(`[CircuitBreaker] ${serviceName} abriu`);
  });

  breaker.on("halfOpen", () => {
    console.log(`[CircuitBreaker] ${serviceName} em teste`);
  });

  breaker.on("close", () => {
    console.log(`[CircuitBreaker] ${serviceName} fechou`);
  });

  breakers.set(serviceName, breaker);

  return breaker;
}

export function getCircuitBreakersStatus() {
  const status = {};

  for (const [serviceName, breaker] of breakers.entries()) {
    status[serviceName] = {
      name: serviceName,
      closed: breaker.closed,
      open: breaker.opened,
      halfOpen: breaker.halfOpen,
      stats: breaker.stats
    };
  }

  return status;
}

export function createCircuitBreakerProxy(
  serviceName,
  target,
  extraOptions = {}
) {
  const proxyMiddleware = createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 5000,
    proxyTimeout: 5000,
    ...extraOptions,

    on: {
      proxyRes(proxyRes, req, res) {
        if (proxyRes.statusCode >= 500) {
          req.__circuitReject?.(
            new Error(`${serviceName} respondeu com ${proxyRes.statusCode}`)
          );
          return;
        }

        req.__circuitResolve?.();
      },

      error(err, req, res) {
        req.__circuitReject?.(err);

        if (!res.headersSent) {
          res.status(503).json({
            message: `${serviceName} indisponível no momento`
          });
        }
      }
    }
  });

  const breaker = getBreaker(serviceName, proxyMiddleware);

  return async function circuitBreakerMiddleware(req, res, next) {
    try {
      await breaker.fire(req, res, next);
    } catch (error) {
      if (!res.headersSent) {
        return res.status(503).json({
          message: `${serviceName} temporariamente indisponível`,
          circuit: breaker.opened
            ? "OPEN"
            : breaker.halfOpen
              ? "HALF_OPEN"
              : "CLOSED"
        });
      }
    }
  };
}