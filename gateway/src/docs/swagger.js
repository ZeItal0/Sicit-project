import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "SICIT API Gateway",
      version: "1.0.0",
      description:
        "Sistema Corporativo para Comunicação Interna, Transmissões Ao Vivo e Gestão Organizacional"
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Desenvolvimento"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },

        internalApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-internal-api-key"
        }
      },

      schemas: {
        HealthServiceStatus: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "up"
            },
            responseTimeMs: {
              type: "number",
              example: 21
            },
            statusCode: {
              type: "number",
              example: 200
            },
            checkedAt: {
              type: "string",
              format: "date-time",
              example: "2026-05-26T01:52:04.429Z"
            }
          }
        },

        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "ok"
            },
            services: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/HealthServiceStatus"
              }
            },
            circuits: {
              type: "object",
              example: {
                "auth-service": {
                  name: "auth-service",
                  closed: true,
                  open: false,
                  halfOpen: false
                }
              }
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2026-05-26T01:52:04.500Z"
            }
          }
        },

        CircuitBreakerResponse: {
          type: "object",
          properties: {
            circuits: {
              type: "object",
              example: {
                "auth-service": {
                  name: "auth-service",
                  closed: true,
                  open: false,
                  halfOpen: false,
                  stats: {
                    failures: 0,
                    fallbacks: 0,
                    successes: 10,
                    rejects: 0,
                    fires: 10,
                    timeouts: 0
                  }
                }
              }
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2026-05-26T02:10:00.000Z"
            }
          }
        },

        EmployeeLoginRequest: {
          type: "object",
          required: ["domain", "login", "password"],
          properties: {
            domain: {
              type: "string",
              example: "empresa-teste"
            },
            login: {
              type: "string",
              example: "mano"
            },
            password: {
              type: "string",
              example: "123456789"
            }
          }
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: ["./src/docs/*.swagger.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true
    })
  );
}