import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { PrismaUserRepository } from "../infrastructure/repositories/PrismaUserRepository.js";
import { PrismaSectorRepository } from "../infrastructure/repositories/PrismaSectorRepository.js";
import { PrismaRoleRepository } from "../infrastructure/repositories/PrismaRoleRepository.js";
import { PrismaPermissionRepository } from "../infrastructure/repositories/PrismaPermissionRepository.js";
import { PrismaRolePermissionRepository } from "../infrastructure/repositories/PrismaRolePermissionRepository.js";

import { GetUserByExternalIdUseCase } from "../application/use-cases/GetUserByExternalIdUseCase.js";
import { AssignUserToSectorUseCase } from "../application/use-cases/AssignUserToSectorUseCase.js";
import { UpdateSectorUseCase } from "../application/use-cases/UpdateSectorUseCase.js";
import { DeleteSectorUseCase } from "../application/use-cases/DeleteSectorUseCase.js";

import { AssignUserToRoleUseCase } from "../application/use-cases/AssignUserToRoleUseCase.js";
import { UpdateUserStatusUseCase } from "../application/use-cases/UpdateUserStatusUseCase.js";

import { SyncUserFromLdapUseCase } from "../application/use-cases/SyncUserFromLdapUseCase.js";
import { CreateUserUseCase } from "../application/use-cases/CreateUserUseCase.js";
import { ListUsersUseCase } from "../application/use-cases/ListUsersUseCase.js";
import { CreateSectorUseCase } from "../application/use-cases/CreateSectorUseCase.js";
import { ListSectorsUseCase } from "../application/use-cases/ListSectorsUseCase.js";
import { CreateRoleUseCase } from "../application/use-cases/CreateRoleUseCase.js";
import { ListRolesUseCase } from "../application/use-cases/ListRolesUseCase.js";
import { CreatePermissionUseCase } from "../application/use-cases/CreatePermissionUseCase.js";
import { ListPermissionsUseCase } from "../application/use-cases/ListPermissionsUseCase.js";
import { AssignPermissionToRoleUseCase } from "../application/use-cases/AssignPermissionToRoleUseCase.js";
import { ListRolePermissionsUseCase } from "../application/use-cases/ListRolePermissionsUseCase.js";
import { AuditServiceClient } from "../infrastructure/services/AuditServiceClient.js";
import { RegisterAuditEventUseCase } from "../application/use-cases/RegisterAuditEventUseCase.js";

import { UserController } from "../presentation/controllers/UserController.js";
import { createUserRoutes } from "../presentation/routes/userRoutes.js";

import { SyncFromHrUseCase } from "../application/use-cases/SyncFromHrUseCase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const userRepository = new PrismaUserRepository();
const sectorRepository = new PrismaSectorRepository();
const roleRepository = new PrismaRoleRepository();
const permissionRepository = new PrismaPermissionRepository();
const rolePermissionRepository = new PrismaRolePermissionRepository();

const syncUserFromLdapUseCase = new SyncUserFromLdapUseCase(userRepository);

const createUserUseCase = new CreateUserUseCase(userRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const getUserByExternalIdUseCase = new GetUserByExternalIdUseCase(userRepository);

const createSectorUseCase = new CreateSectorUseCase(sectorRepository);
const listSectorsUseCase = new ListSectorsUseCase(sectorRepository);
const updateSectorUseCase = new UpdateSectorUseCase(sectorRepository);

const createRoleUseCase = new CreateRoleUseCase(roleRepository);
const listRolesUseCase = new ListRolesUseCase(roleRepository);

const createPermissionUseCase = new CreatePermissionUseCase(permissionRepository);
const listPermissionsUseCase = new ListPermissionsUseCase(permissionRepository);

const assignUserToSectorUseCase = new AssignUserToSectorUseCase(userRepository);

const assignPermissionToRoleUseCase = new AssignPermissionToRoleUseCase(rolePermissionRepository);
const listRolePermissionsUseCase = new ListRolePermissionsUseCase(rolePermissionRepository);
const deleteSectorUseCase = new DeleteSectorUseCase(sectorRepository);

const assignUserToRoleUseCase = new AssignUserToRoleUseCase(userRepository);
const updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepository);

const auditServiceClient = new AuditServiceClient();
const registerAuditEventUseCase = new RegisterAuditEventUseCase(auditServiceClient);

const syncFromHrUseCase = new SyncFromHrUseCase(
  userRepository,
  sectorRepository,
  roleRepository
);

const userController = new UserController(
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
);

app.use("/", createUserRoutes(userController));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`User Service rodando na porta ${PORT}`);
});