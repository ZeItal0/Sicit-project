/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica a saúde dos microserviços
 *     tags:
 *       - Monitoramento
 *     responses:
 *       200:
 *         description: Status dos microserviços
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HealthResponse"
 */