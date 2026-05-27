/**
 * @swagger
 * /audit/health:
 *   get:
 *     summary: Verifica saúde do audit-service
 *     tags:
 *       - Auditoria
 *     security: []
 *     responses:
 *       200:
 *         description: Audit-service funcionando
 */

/**
 * @swagger
 * /audit/events:
 *   post:
 *     summary: Registra um evento de auditoria
 *     description: Cria um evento de auditoria corporativa relacionado a ações realizadas no sistema SICIT.
 *     tags:
 *       - Auditoria
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - resourceType
 *             properties:
 *               action:
 *                 type: string
 *                 example: "LIVE_STARTED"
 *               resourceType:
 *                 type: string
 *                 example: "STREAM"
 *               resourceId:
 *                 type: string
 *                 example: "stream-001"
 *               metadata:
 *                 type: object
 *                 example:
 *                   streamTitle: "Treinamento Interno sobre Segurança da Informação"
 *                   visibility: "public"
 *                   sectorId: "fddee76f-8ba4-4822-805b-255c4bb11b9f"
 *                   hostEmail: "olati@sicit.local"
 *     responses:
 *       201:
 *         description: Evento de auditoria registrado com sucesso
 *       400:
 *         description: Campos obrigatórios não informados
 *       401:
 *         description: Token não informado ou inválido
 *
 *   get:
 *     summary: Lista eventos de auditoria
 *     description: Retorna eventos de auditoria filtrados por tenant, usuário, ação ou recurso.
 *     tags:
 *       - Auditoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         example: "0de43ea9-a988-47f9-959e-ec055738ee7a"
 *
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         example: "LIVE_STARTED"
 *
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         example: "STREAM"
 *
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *         example: "stream-001"
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 50
 *
 *     responses:
 *       200:
 *         description: Eventos de auditoria retornados com sucesso
 *       401:
 *         description: Token não informado ou inválido
 */