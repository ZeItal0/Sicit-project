/**
 * @swagger
 * /stream/health:
 *   get:
 *     summary: Verifica saúde do stream-service
 *     tags:
 *       - Transmissões
 *     security: []
 *     responses:
 *       200:
 *         description: Stream-service funcionando
 */

/**
 * @swagger
 * /stream/streams:
 *   post:
 *     summary: Cria uma transmissão
 *     description: Cria uma sessão de transmissão ao vivo e, quando possível, também cria um canal de chat no communication-service.
 *     tags:
 *       - Transmissões
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Treinamento Interno sobre Segurança da Informação"
 *               description:
 *                 type: string
 *                 example: "Live corporativa para orientar colaboradores sobre boas práticas de segurança, proteção de dados e uso adequado dos sistemas internos."
 *               visibility:
 *                 type: string
 *                 example: "public"
 *               sectorId:
 *                 type: string
 *                 example: "fddee76f-8ba4-4822-805b-255c4bb11b9f"
 *     responses:
 *       201:
 *         description: Transmissão criada com sucesso
 *
 *   get:
 *     summary: Lista transmissões do tenant
 *     tags:
 *       - Transmissões
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transmissões retornada
 */

/**
 * @swagger
 * /stream/streams/{streamId}:
 *   get:
 *     summary: Busca transmissão por ID
 *     tags:
 *       - Transmissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         example: "stream-001"
 *     responses:
 *       200:
 *         description: Transmissão encontrada
 *       404:
 *         description: Transmissão não encontrada
 */

/**
 * @swagger
 * /stream/streams/{streamId}/start:
 *   post:
 *     summary: Inicia uma transmissão
 *     description: Altera o status da transmissão para live. Somente o host pode iniciar.
 *     tags:
 *       - Transmissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         example: "stream-001"
 *     responses:
 *       200:
 *         description: Transmissão iniciada com sucesso
 *       400:
 *         description: Transmissão não encontrada, já iniciada, encerrada ou usuário sem permissão
 */

/**
 * @swagger
 * /stream/streams/{streamId}/end:
 *   post:
 *     summary: Encerra uma transmissão
 *     description: Altera o status da transmissão para ended. Somente o host pode encerrar.
 *     tags:
 *       - Transmissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         example: "stream-001"
 *     responses:
 *       200:
 *         description: Transmissão encerrada com sucesso
 *       400:
 *         description: Transmissão não encontrada ou usuário sem permissão
 */

/**
 * @swagger
 * /stream/streams/{streamId}/join:
 *   post:
 *     summary: Participa de uma transmissão
 *     description: Registra o usuário autenticado como participante da transmissão e tenta adicioná-lo ao canal de chat vinculado.
 *     tags:
 *       - Transmissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         example: "stream-001"
 *     responses:
 *       201:
 *         description: Participante registrado na transmissão
 *       400:
 *         description: Transmissão não encontrada ou dados inválidos
 */

/**
 * @swagger
 * /stream/streams/{streamId}/presences:
 *   get:
 *     summary: Lista presenças da transmissão
 *     description: Retorna os registros de presença dos usuários que participaram da live.
 *     tags:
 *       - Presenças em Lives
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *         example: "stream-001"
 *     responses:
 *       200:
 *         description: Lista de presenças retornada
 */

/**
 * @swagger
 * /stream/stats/transmissions-by-sector:
 *   get:
 *     summary: Estatísticas de transmissões por setor
 *     description: Retorna a quantidade de transmissões associadas a cada setor do tenant.
 *     tags:
 *       - Estatísticas de Lives
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */