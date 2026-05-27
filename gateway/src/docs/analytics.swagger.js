/**
 * @swagger
 * /analytics/health:
 *   get:
 *     summary: Verifica saúde do analytics-service
 *     tags:
 *       - Analytics
 *     security: []
 *     responses:
 *       200:
 *         description: Analytics-service funcionando
 */

/**
 * @swagger
 * /analytics/dashboard/executive:
 *   get:
 *     summary: Retorna dashboard executivo
 *     description: Consolida dados de usuários, treinamentos, transmissões, certificados e eventos de auditoria.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard executivo retornado com sucesso
 */

/**
 * @swagger
 * /analytics/kpis/training:
 *   get:
 *     summary: Retorna KPIs de treinamentos
 *     description: Retorna total de treinamentos, certificados gerados, resultados calculados, trilhas concluídas e tentativas de sincronização com Moodle.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs de treinamentos retornados com sucesso
 */

/**
 * @swagger
 * /analytics/kpis/stream:
 *   get:
 *     summary: Retorna KPIs de transmissões ao vivo
 *     description: Retorna transmissões agendadas, ao vivo, encerradas e eventos de entrada/saída de espectadores.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs de transmissões retornados com sucesso
 */

/**
 * @swagger
 * /analytics/kpis/learning-paths:
 *   get:
 *     summary: Retorna KPIs de trilhas de aprendizagem
 *     description: Retorna total de trilhas, resultados gerados, trilhas concluídas, média de conclusão e pendências.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs de trilhas retornados com sucesso
 */

/**
 * @swagger
 * /analytics/audit/summary:
 *   get:
 *     summary: Retorna resumo de auditoria
 *     description: Agrupa eventos de auditoria por ação e retorna o total de eventos registrados.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo de auditoria retornado com sucesso
 */