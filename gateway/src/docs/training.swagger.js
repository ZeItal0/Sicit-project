/**
 * @swagger
 * /training/health:
 *   get:
 *     summary: Verifica saúde do training-service
 *     tags:
 *       - Treinamentos
 *     security: []
 *     responses:
 *       200:
 *         description: Training-service funcionando
 */

/**
 * @swagger
 * /training:
 *   post:
 *     summary: Cria um treinamento
 *     tags:
 *       - Treinamentos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - streamId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Treinamento de Segurança da Informação"
 *               description:
 *                 type: string
 *                 example: "Capacitação sobre boas práticas de segurança, LGPD e uso correto dos sistemas internos."
 *               streamId:
 *                 type: string
 *                 example: "stream-001"
 *               minAttendancePercent:
 *                 type: number
 *                 example: 80
 *     responses:
 *       201:
 *         description: Treinamento criado com sucesso
 *
 *   get:
 *     summary: Lista treinamentos
 *     tags:
 *       - Treinamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de treinamentos retornada
 */

/**
 * @swagger
 * /training/{trainingId}/report:
 *   get:
 *     summary: Gera relatório de presença do treinamento
 *     tags:
 *       - Resultados de Treinamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         example: "training-001"
 *     responses:
 *       200:
 *         description: Relatório de presença gerado
 */

/**
 * @swagger
 * /training/{trainingId}/results/generate:
 *   post:
 *     summary: Gera resultados do treinamento
 *     description: Calcula aprovação dos participantes com base no tempo assistido da live vinculada.
 *     tags:
 *       - Resultados de Treinamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         example: "training-001"
 *     responses:
 *       200:
 *         description: Resultados gerados com sucesso
 */

/**
 * @swagger
 * /training/{trainingId}/results:
 *   get:
 *     summary: Lista resultados de um treinamento
 *     tags:
 *       - Resultados de Treinamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         example: "training-001"
 *     responses:
 *       200:
 *         description: Resultados do treinamento retornados
 */

/**
 * @swagger
 * /training/me/results:
 *   get:
 *     summary: Lista meus resultados de treinamento
 *     tags:
 *       - Resultados de Treinamento
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultados do usuário autenticado retornados
 */

/**
 * @swagger
 * /training/{trainingId}/certificate:
 *   post:
 *     summary: Gera certificado de treinamento
 *     tags:
 *       - Certificados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trainingId
 *         required: true
 *         schema:
 *           type: string
 *         example: "training-001"
 *     responses:
 *       200:
 *         description: Certificado gerado com sucesso
 */

/**
 * @swagger
 * /training/paths:
 *   post:
 *     summary: Cria uma trilha de aprendizagem
 *     description: Cria uma trilha no SICIT, cria curso correspondente no Moodle, matricula usuários dos setores vinculados e notifica os participantes.
 *     tags:
 *       - Trilhas de Aprendizagem
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - sectorIds
 *               - steps
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Trilha de Integração Corporativa"
 *               description:
 *                 type: string
 *                 example: "Trilha para novos colaboradores com lives, conteúdos obrigatórios e acompanhamento pelo Moodle."
 *               color:
 *                 type: string
 *                 example: "#D7C900"
 *               icon:
 *                 type: string
 *                 example: "🎓"
 *               minCompletionPercent:
 *                 type: number
 *                 example: 80
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-30T23:59:59.000Z"
 *               sectorIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "fddee76f-8ba4-4822-805b-255c4bb11b9f"
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example:
 *                   - title: "Live de Boas-vindas"
 *                     description: "Apresentação institucional e orientações iniciais."
 *                     type: "LIVE"
 *                     order: 1
 *                     requiredPercent: 80
 *                     estimatedMinutes: 60
 *                     streamId: null
 *                     status: "PENDING_LINK"
 *                   - title: "Treinamento de Segurança"
 *                     description: "Capacitação sobre segurança da informação."
 *                     type: "LIVE"
 *                     order: 2
 *                     requiredPercent: 85
 *                     estimatedMinutes: 90
 *                     streamId: null
 *                     status: "PENDING_LINK"
 *     responses:
 *       201:
 *         description: Trilha criada, sincronizada com Moodle e usuários notificados
 *
 *   get:
 *     summary: Lista trilhas de aprendizagem
 *     tags:
 *       - Trilhas de Aprendizagem
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas retornada
 */

/**
 * @swagger
 * /training/paths/results/all:
 *   get:
 *     summary: Lista todos os resultados de trilhas
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos os resultados de trilhas retornados
 */

/**
 * @swagger
 * /training/paths/{pathId}/steps/{stepId}/stream:
 *   put:
 *     summary: Vincula uma live a uma etapa da trilha
 *     tags:
 *       - Trilhas de Aprendizagem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         example: "step-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - streamId
 *             properties:
 *               streamId:
 *                 type: string
 *                 example: "stream-001"
 *               streamTitle:
 *                 type: string
 *                 example: "Treinamento Interno sobre Segurança da Informação"
 *     responses:
 *       200:
 *         description: Live vinculada à etapa com sucesso
 */

/**
 * @swagger
 * /training/paths/{pathId}/steps/{stepId}/results/generate:
 *   post:
 *     summary: Gera resultados de uma etapa da trilha
 *     description: Calcula presença da live vinculada, atualiza progresso da trilha e sincroniza nota/progresso com Moodle.
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         example: "step-001"
 *     responses:
 *       200:
 *         description: Resultados da etapa gerados e sincronizados
 */

/**
 * @swagger
 * /training/paths/{pathId}/me/step-results:
 *   get:
 *     summary: Lista meus resultados das etapas de uma trilha
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *     responses:
 *       200:
 *         description: Resultados das etapas retornados
 */

/**
 * @swagger
 * /training/paths/me/results:
 *   get:
 *     summary: Lista meus resultados de trilhas
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultados das trilhas do usuário retornados
 */

/**
 * @swagger
 * /training/paths/{pathId}/results/generate:
 *   post:
 *     summary: Gera resultado final da trilha
 *     description: Calcula conclusão geral da trilha e tenta sincronizar resultado com Moodle.
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *     responses:
 *       200:
 *         description: Resultado final da trilha gerado
 */

/**
 * @swagger
 * /training/paths/{pathId}/results:
 *   get:
 *     summary: Lista resultados de uma trilha
 *     tags:
 *       - Resultados de Trilhas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *     responses:
 *       200:
 *         description: Resultados da trilha retornados
 */

/**
 * @swagger
 * /training/paths/{pathId}/certificate:
 *   post:
 *     summary: Gera certificado da trilha
 *     tags:
 *       - Certificados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pathId
 *         required: true
 *         schema:
 *           type: string
 *         example: "path-001"
 *     responses:
 *       200:
 *         description: Certificado da trilha gerado com sucesso
 */