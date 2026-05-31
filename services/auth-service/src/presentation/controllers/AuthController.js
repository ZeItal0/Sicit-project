export class AuthController {
  constructor(
    registerTenantAdminUseCase,
    loginTenantAdminUseCase,
    loginEmployeeUseCase,
    getMeUseCase,
    loginWithGoogleUseCase,
    linkGoogleUserToTenantUseCase,
    testLdapConnectionUseCase,
    createLdapConfigUseCase,
    createHrIntegrationConfigUseCase,
    getHrIntegrationConfigUseCase,
    syncHrIntegrationUseCase
  ) {
    this.registerTenantAdminUseCase = registerTenantAdminUseCase;
    this.loginTenantAdminUseCase = loginTenantAdminUseCase;
    this.loginEmployeeUseCase = loginEmployeeUseCase;
    this.getMeUseCase = getMeUseCase;
    this.loginWithGoogleUseCase = loginWithGoogleUseCase;
    this.linkGoogleUserToTenantUseCase = linkGoogleUserToTenantUseCase;
    this.testLdapConnectionUseCase = testLdapConnectionUseCase;
    this.createLdapConfigUseCase = createLdapConfigUseCase;
    this.createHrIntegrationConfigUseCase = createHrIntegrationConfigUseCase;
    this.getHrIntegrationConfigUseCase = getHrIntegrationConfigUseCase;
    this.syncHrIntegrationUseCase = syncHrIntegrationUseCase;
  }

  registerTenantAdmin = async (req, res) => {
    try {
      const result = await this.registerTenantAdminUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  loginAdmin = async (req, res) => {
    try {
      const result = await this.loginTenantAdminUseCase.execute(req.body);
      return res.status(200).json(result);
    } catch (error) {
      const status = error.message === "Credenciais inválidas" ? 401 : 400;
      return res.status(status).json({ message: error.message });
    }
  };

  loginEmployee = async (req, res) => {
    try {
      const result = await this.loginEmployeeUseCase.execute(req.body);
      return res.status(200).json(result);
    } catch (error) {
      const status = error.message === "Credenciais inválidas" ? 401 : 400;
      return res.status(status).json({ message: error.message });
    }
  };

  me = (req, res) => {
    try {
      const result = this.getMeUseCase.execute(req.user);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  dashboard = (req, res) => {
    return res.status(200).json({
      message: "Acesso autorizado",
      user: req.user
    });
  };

  loginGoogle = async (req, res) => {
    try {
      const result = await this.loginWithGoogleUseCase.execute({
        idToken: req.body.idToken
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  };

  linkGoogleTenant = async (req, res) => {
    try {
      const result = await this.linkGoogleUserToTenantUseCase.execute({
        googleUserId: req.user.id,
        domain: req.body.domain
      });

      return res.status(200).json({
        message: "Usuário Google vinculado à empresa com sucesso",
        user: result
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  testLdapConnection = async (req, res) => {
    try {
      const result = await this.testLdapConnectionUseCase.execute(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createLdapConfig = async (req, res) => {
    try {
      const result = await this.createLdapConfigUseCase.execute({
        tenantId: req.user.tenantId || req.body.tenantId,
        ldapUrl: req.body.ldapUrl,
        baseDn: req.body.baseDn,
        bindDn: req.body.bindDn,
        bindPassword: req.body.bindPassword,
        userAttribute: req.body.userAttribute || "uid",
        isActive: true
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createHrConfig = async (req, res) => {
    try {
      const result = await this.createHrIntegrationConfigUseCase.execute({
        tenantId: req.user.tenantId,
        provider: req.body.provider || "CUSTOM_API",
        apiUrl: req.body.apiUrl,
        apiToken: req.body.apiToken,
        employeesEndpoint: req.body.employeesEndpoint,
        sectorsEndpoint: req.body.sectorsEndpoint,
        rolesEndpoint: req.body.rolesEndpoint,
        syncEmployees: req.body.syncEmployees,
        syncRoles: req.body.syncRoles,
        syncSectors: req.body.syncSectors,
        frequency: req.body.frequency,
      });

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  getHrConfig = async (req, res) => {
    try {
      const result = await this.getHrIntegrationConfigUseCase.execute({
        tenantId: req.user.tenantId,
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
  syncHr = async (req, res) => {
    try {
      const result = await this.syncHrIntegrationUseCase.execute({
        tenantId: req.user.tenantId,
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

}