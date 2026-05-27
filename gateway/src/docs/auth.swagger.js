/**
 * @swagger
 * /auth/health:
 *   get:
 *     summary: Verifica saúde do auth-service
 *     tags:
 *       - Autenticação
 *     security: []
 *     responses:
 *       200:
 *         description: Auth-service funcionando
 */

/**
 * @swagger
 * /auth/login-google:
 *   post:
 *     summary: Login com Google
 *     description: Realiza autenticação utilizando o ID Token retornado pelo Google OAuth.
 *     tags:
 *       - Autenticação
 *     security: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: ""
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *
 *       400:
 *         description: ID Token inválido
 *
 *       401:
 *         description: Não autorizado
 *
 *       503:
 *         description: Auth-service indisponível
 */

/**
 * @swagger
 * /auth/google/link-tenant:
 *   post:
 *     summary: Vincula usuário Google a uma empresa
 *     description: Vincula o usuário autenticado via Google a um tenant/domínio corporativo.
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "empresa-teste"
 *     responses:
 *       200:
 *         description: Usuário Google vinculado à empresa com sucesso
 *       400:
 *         description: Domínio obrigatório ou erro ao vincular usuário
 *       401:
 *         description: Token não informado ou inválido
 *       503:
 *         description: Auth-service indisponível
 */

/**
 * @swagger
 * /auth/ldap/test-connection:
 *   post:
 *     summary: Testa conexão LDAP
 *     tags:
 *       - Autenticação
 *     security: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ldapUrl
 *               - bindDn
 *               - bindPassword
 *             properties:
 *               ldapUrl:
 *                 type: string
 *                 example: "ldap://localhost:389"
 *
 *               bindDn:
 *                 type: string
 *                 example: "cn=admin,dc=sicit,dc=local"
 *
 *               bindPassword:
 *                 type: string
 *                 example: "admin"
 *
 *     responses:
 *       200:
 *         description: Teste de conexão executado
 */

/**
 * @swagger
 * /auth/login-employee:
 *   post:
 *     summary: Login do funcionário
 *     description: Realiza login de funcionário utilizando domínio da empresa, login LDAP e senha.
 *     tags:
 *       - Autenticação
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/EmployeeLoginRequest"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Domínio, login e senha são obrigatórios
 *       401:
 *         description: Credenciais inválidas
 *       503:
 *         description: Auth-service indisponível
 */

/**
 * @swagger
 * /auth/hr/config:
 *   post:
 *     summary: Cria configuração de integração com RH
 *     tags:
 *       - Autenticação
 *     responses:
 *       201:
 *         description: Configuração de RH criada com sucesso
 *   get:
 *     summary: Consulta configuração de integração com RH
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Configuração de RH retornada com sucesso
 */

/**
 * @swagger
 * /auth/hr/sync:
 *   post:
 *     summary: Executa sincronização com RH
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Sincronização com RH executada com sucesso
 */