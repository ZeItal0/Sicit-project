/**
 * @swagger
 * /communication/health:
 *   get:
 *     summary: Verifica saúde do communication-service
 *     tags:
 *       - Comunicação
 *     security: []
 *     responses:
 *       200:
 *         description: Communication-service funcionando
 */

/**
 * @swagger
 * /communication/channels:
 *   post:
 *     summary: Cria um canal de comunicação
 *     tags:
 *       - Comunicação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Comunicados Gerais"
 *               description:
 *                 type: string
 *                 example: "Canal oficial para avisos internos da empresa"
 *               type:
 *                 type: string
 *                 example: "public"
 *     responses:
 *       201:
 *         description: Canal criado com sucesso
 *
 *   get:
 *     summary: Lista canais do tenant
 *     tags:
 *       - Comunicação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canais retornada
 */

/**
 * @swagger
 * /communication/channels/{channelId}/join:
 *   post:
 *     summary: Entrar em um canal
 *     tags:
 *       - Comunicação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-001"
 *     responses:
 *       201:
 *         description: Usuário adicionado ao canal
 */

/**
 * @swagger
 * /communication/direct-channels:
 *   post:
 *     summary: Cria ou retorna um canal direto
 *     tags:
 *       - Comunicação Direta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 example: "uid=joao,ou=people,dc=sicit,dc=local"
 *     responses:
 *       201:
 *         description: Canal direto criado ou localizado
 *
 *   get:
 *     summary: Lista canais diretos do usuário
 *     tags:
 *       - Comunicação Direta
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de canais diretos
 */

/**
 * @swagger
 * /communication/direct-channels/detailed:
 *   get:
 *     summary: Lista canais diretos detalhados
 *     description: Retorna canais diretos com usuário relacionado, presença, última mensagem e quantidade de mensagens não lidas.
 *     tags:
 *       - Comunicação Direta
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista detalhada de canais diretos
 */

/**
 * @swagger
 * /communication/channels/{channelId}/messages:
 *   post:
 *     summary: Envia mensagem em um canal
 *     tags:
 *       - Mensagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Bom dia equipe, a reunião começará às 09h."
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *
 *   get:
 *     summary: Lista mensagens de um canal
 *     tags:
 *       - Mensagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-001"
 *     responses:
 *       200:
 *         description: Lista de mensagens retornada
 */

/**
 * @swagger
 * /communication/channels/{channelId}/messages/{messageId}/read:
 *   post:
 *     summary: Marca mensagem como lida
 *     tags:
 *       - Mensagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-001"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         example: "message-001"
 *     responses:
 *       201:
 *         description: Mensagem marcada como lida
 */

/**
 * @swagger
 * /communication/channels/{channelId}/messages/{messageId}/reads:
 *   get:
 *     summary: Lista leituras de uma mensagem
 *     tags:
 *       - Mensagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-001"
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         example: "message-001"
 *     responses:
 *       200:
 *         description: Lista de usuários que leram a mensagem
 */

/**
 * @swagger
 * /communication/notifications:
 *   post:
 *     summary: Cria uma notificação
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "uid=joao,ou=people,dc=sicit,dc=local"
 *               type:
 *                 type: string
 *                 example: "NEW_MESSAGE"
 *               content:
 *                 type: string
 *                 example: "Você recebeu uma nova mensagem no canal Comunicados Gerais"
 *               channelId:
 *                 type: string
 *                 example: "channel-001"
 *               messageId:
 *                 type: string
 *                 example: "message-001"
 *     responses:
 *       201:
 *         description: Notificação criada
 *
 *   get:
 *     summary: Lista notificações do usuário
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações retornada
 */

/**
 * @swagger
 * /communication/notifications/{notificationId}/read:
 *   patch:
 *     summary: Marca notificação como lida
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "notification-001"
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 */

/**
 * @swagger
 * /communication/notifications/unread-count:
 *   get:
 *     summary: Conta notificações não lidas
 *     tags:
 *       - Notificações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quantidade de notificações não lidas
 */

/**
 * @swagger
 * /communication/presence/{userId}:
 *   get:
 *     summary: Consulta presença de um usuário
 *     tags:
 *       - Presença
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uid=joao,ou=people,dc=sicit,dc=local"
 *     responses:
 *       200:
 *         description: Presença do usuário retornada
 */