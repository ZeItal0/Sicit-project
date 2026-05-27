/**
 * @swagger
 * /users/health:
 *   get:
 *     summary: Verifica saúde do user-service
 *     tags:
 *       - Usuários
 *     security: []
 *     responses:
 *       200:
 *         description: User-service funcionando
 */

/**
 * @swagger
 * /users/users:
 *   post:
 *     summary: Cria um usuário
 *     tags:
 *       - Usuários
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
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 example: "joao.silva@sicit.local"
 *               roleId:
 *                 type: string
 *                 example: "role-001"
 *               sectorId:
 *                 type: string
 *                 example: "sector-001"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não informado ou inválido
 *       403:
 *         description: Permissão CREATE_USER não concedida
 *
 *   get:
 *     summary: Lista usuários do tenant
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */

/**
 * @swagger
 * /users/users/by-external-id/{externalId}:
 *   get:
 *     summary: Busca usuário pelo ID externo
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: externalId
 *         required: true
 *         schema:
 *           type: string
 *         example: "uid=mano,ou=people,dc=sicit,dc=local"
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /users/users/{userId}/sector:
 *   put:
 *     summary: Atribui setor a um usuário
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectorId:
 *                 type: string
 *                 example: "sector-001"
 *     responses:
 *       200:
 *         description: Setor atribuído ao usuário
 */

/**
 * @swagger
 * /users/users/{userId}/role:
 *   put:
 *     summary: Atribui cargo/role a um usuário
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "role-001"
 *     responses:
 *       200:
 *         description: Role atribuída ao usuário
 */

/**
 * @swagger
 * /users/users/{userId}/status:
 *   put:
 *     summary: Atualiza status do usuário
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Status atualizado
 */

/**
 * @swagger
 * /users/sectors:
 *   post:
 *     summary: Cria um setor
 *     tags:
 *       - Setores
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
 *                 example: "Tecnologia da Informação"
 *               description:
 *                 type: string
 *                 example: "Setor responsável por sistemas internos"
 *     responses:
 *       201:
 *         description: Setor criado com sucesso
 *
 *   get:
 *     summary: Lista setores
 *     tags:
 *       - Setores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de setores retornada
 */

/**
 * @swagger
 * /users/sectors/{sectorId}:
 *   put:
 *     summary: Atualiza um setor
 *     tags:
 *       - Setores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "sector-001"
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
 *                 example: "Governança de TI"
 *               description:
 *                 type: string
 *                 example: "Setor responsável por compliance e sistemas"
 *     responses:
 *       200:
 *         description: Setor atualizado
 *
 *   delete:
 *     summary: Remove um setor
 *     tags:
 *       - Setores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *         example: "sector-001"
 *     responses:
 *       200:
 *         description: Setor excluído com sucesso
 */

/**
 * @swagger
 * /users/roles:
 *   post:
 *     summary: Cria uma role/cargo
 *     tags:
 *       - Cargos e Permissões
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
 *                 example: "GESTOR_TREINAMENTO"
 *               description:
 *                 type: string
 *                 example: "Responsável por criar e acompanhar treinamentos"
 *     responses:
 *       201:
 *         description: Role criada com sucesso
 *
 *   get:
 *     summary: Lista roles/cargos
 *     tags:
 *       - Cargos e Permissões
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles retornada
 */

/**
 * @swagger
 * /users/permissions:
 *   post:
 *     summary: Cria uma permissão
 *     tags:
 *       - Cargos e Permissões
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: "CREATE_USER"
 *               name:
 *                 type: string
 *                 example: "Criar usuário"
 *               description:
 *                 type: string
 *                 example: "Permite criar usuários no tenant"
 *     responses:
 *       201:
 *         description: Permissão criada
 *
 *   get:
 *     summary: Lista permissões
 *     tags:
 *       - Cargos e Permissões
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões retornada
 */

/**
 * @swagger
 * /users/roles/{roleId}/permissions:
 *   post:
 *     summary: Atribui permissão a uma role
 *     tags:
 *       - Cargos e Permissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionId
 *             properties:
 *               permissionId:
 *                 type: string
 *                 example: "permission-001"
 *     responses:
 *       201:
 *         description: Permissão atribuída à role
 *
 *   get:
 *     summary: Lista permissões de uma role
 *     tags:
 *       - Cargos e Permissões
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-001"
 *     responses:
 *       200:
 *         description: Lista de permissões da role
 */

/**
 * @swagger
 * /users/internal/users/sync-from-ldap:
 *   post:
 *     summary: Sincroniza usuário vindo do LDAP
 *     tags:
 *       - Integrações Internas
 *     security:
 *       - internalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - name
 *               - email
 *               - externalId
 *             properties:
 *               tenantId:
 *                 type: string
 *                 example: "tenant-001"
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 example: "joao.silva@sicit.local"
 *               externalId:
 *                 type: string
 *                 example: "uid=joao,ou=people,dc=sicit,dc=local"
 *     responses:
 *       200:
 *         description: Usuário sincronizado do LDAP
 */

/**
 * @swagger
 * /users/internal/hr/sync:
 *   post:
 *     summary: Sincroniza dados vindos do RH
 *     tags:
 *       - Integrações Internas
 *     security:
 *       - internalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *             properties:
 *               tenantId:
 *                 type: string
 *                 example: "tenant-001"
 *               employees:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example:
 *                   - externalId: "EMP-001"
 *                     name: "Maria Oliveira"
 *                     email: "maria.oliveira@sicit.local"
 *                     sectorName: "Recursos Humanos"
 *                     roleName: "Analista de RH"
 *               sectors:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example:
 *                   - externalId: "SEC-001"
 *                     name: "Recursos Humanos"
 *                     description: "Setor de gestão de pessoas"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example:
 *                   - externalId: "ROLE-001"
 *                     name: "Analista de RH"
 *                     description: "Cargo sincronizado do RH"
 *     responses:
 *       200:
 *         description: Sincronização com RH concluída
 */