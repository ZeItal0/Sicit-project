export class UserController {
  constructor(
    createUserUseCase,
    listUsersUseCase,
    createSectorUseCase,
    listSectorsUseCase,
    createRoleUseCase,
    listRolesUseCase,
    createPermissionUseCase,
    listPermissionsUseCase,
    assignPermissionToRoleUseCase,
    listRolePermissionsUseCase,
    syncUserFromLdapUseCase,
    getUserByExternalIdUseCase,
    registerAuditEventUseCase,
    assignUserToSectorUseCase,
    updateSectorUseCase,
    deleteSectorUseCase,
    assignUserToRoleUseCase,
    updateUserStatusUseCase,
    syncFromHrUseCase
  ) {
    this.createUserUseCase = createUserUseCase;
    this.listUsersUseCase = listUsersUseCase;
    this.createSectorUseCase = createSectorUseCase;
    this.listSectorsUseCase = listSectorsUseCase;
    this.createRoleUseCase = createRoleUseCase;
    this.listRolesUseCase = listRolesUseCase;
    this.createPermissionUseCase = createPermissionUseCase;
    this.listPermissionsUseCase = listPermissionsUseCase;
    this.assignPermissionToRoleUseCase = assignPermissionToRoleUseCase;
    this.listRolePermissionsUseCase = listRolePermissionsUseCase;
    this.syncUserFromLdapUseCase = syncUserFromLdapUseCase;
    this.getUserByExternalIdUseCase = getUserByExternalIdUseCase;
    this.registerAuditEventUseCase = registerAuditEventUseCase;
    this.assignUserToSectorUseCase = assignUserToSectorUseCase;
    this.updateSectorUseCase = updateSectorUseCase;
    this.deleteSectorUseCase = deleteSectorUseCase;
    this.assignUserToRoleUseCase = assignUserToRoleUseCase;
    this.updateUserStatusUseCase = updateUserStatusUseCase;
    this.syncFromHrUseCase = syncFromHrUseCase;
  }

  createUser = async (req, res) => {
    try {
      const result = await this.createUserUseCase.execute({
        tenantId: req.user.tenantId,
        ...req.body,
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "USER_CREATED",
        resourceType: "USER",
        resourceId: result.id,
        metadata: {
          createdBy: req.user.id,
          email: result.email
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listUsers = async (req, res) => {
    try {
      const result = await this.listUsersUseCase.execute({
        tenantId: req.user.tenantId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createSector = async (req, res) => {
    try {
      const result = await this.createSectorUseCase.execute({
        tenantId: req.user.tenantId,
        ...req.body,
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "SECTOR_CREATED",
        resourceType: "SECTOR",
        resourceId: result.id,
        metadata: {
          createdBy: req.user.id,
          name: result.name
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listSectors = async (req, res) => {
    try {
      const result = await this.listSectorsUseCase.execute({
        tenantId: req.user.tenantId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createRole = async (req, res) => {
    try {
      const result = await this.createRoleUseCase.execute({
        tenantId: req.user.tenantId,
        ...req.body,
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "ROLE_CREATED",
        resourceType: "ROLE",
        resourceId: result.id,
        metadata: {
          createdBy: req.user.id,
          name: result.name
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listRoles = async (req, res) => {
    try {
      const result = await this.listRolesUseCase.execute({
        tenantId: req.user.tenantId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  createPermission = async (req, res) => {
    try {
      const result = await this.createPermissionUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listPermissions = async (req, res) => {
    try {
      const result = await this.listPermissionsUseCase.execute();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  assignPermissionToRole = async (req, res) => {
    try {
      const result = await this.assignPermissionToRoleUseCase.execute({
        roleId: req.params.roleId,
        permissionId: req.body.permissionId,
      });
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1],
        action: "PERMISSION_ASSIGNED",
        resourceType: "ROLE",
        resourceId: req.params.roleId,
        metadata: {
          permissionId: req.body.permissionId,
          assignedBy: req.user.id
        }
      });

      return res.status(201).json({
        ...result,
        audit
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  listRolePermissions = async (req, res) => {
    try {
      const result = await this.listRolePermissionsUseCase.execute({
        roleId: req.params.roleId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  syncUserFromLdap = async (req, res) => {
    try {
      const result = await this.syncUserFromLdapUseCase.execute(req.body);
      const audit = await this.registerAuditEventUseCase.execute({
        token: req.headers.authorization?.split(" ")[1] || req.headers["x-api-key"],
        action: "LDAP_USER_SYNCED",
        resourceType: "USER",
        resourceId: result.id,
        metadata: {
          externalId: result.externalId,
          email: result.email
        }
      });

      return res.status(200).json({
        ...result,
        audit
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  };

  getUserByExternalId = async (req, res) => {
    try {
      const result = await this.getUserByExternalIdUseCase.execute({
        tenantId: req.user.tenantId,
        externalId: req.params.externalId
      });

      if (!result) {
        return res.status(404).json({
          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  };

  assignUserToSector = async (req, res) => {
    try {
      const result = await this.assignUserToSectorUseCase.execute({
        userId: req.params.userId,
        sectorId: req.body.sectorId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  };
  updateSector = async (req, res) => {
    try {
      const result = await this.updateSectorUseCase.execute({
        id: req.params.sectorId,
        tenantId: req.user.tenantId,
        ...req.body
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
  deleteSector = async (req, res) => {
    try {
      const result = await this.deleteSectorUseCase.execute({
        id: req.params.sectorId,
        tenantId: req.user.tenantId
      });

      return res.status(200).json({
        message: "Setor excluído com sucesso",
        sector: result
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  assignUserToRole = async (req, res) => {
    try {
      const result = await this.assignUserToRoleUseCase.execute({
        userId: req.params.userId,
        roleId: req.body.roleId
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  updateUserStatus = async (req, res) => {
    try {
      const result = await this.updateUserStatusUseCase.execute({
        userId: req.params.userId,
        status: req.body.status
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  syncFromHr = async (req, res) => {
  try {
    const result = await this.syncFromHrUseCase.execute(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
}