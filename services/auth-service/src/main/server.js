import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { TokenService } from "../domain/services/TokenService.js";
import { BcryptPasswordHashService } from "../infrastructure/services/BcryptPasswordHashService.js";
import { PrismaTenantRepository } from "../infrastructure/repositories/PrismaTenantRepository.js";
import { PrismaTenantAdminRepository } from "../infrastructure/repositories/PrismaTenantAdminRepository.js";
import { PrismaTenantLdapConfigRepository } from "../infrastructure/repositories/PrismaTenantLdapConfigRepository.js";
import { CreateLdapConfigUseCase } from "../application/use-cases/CreateLdapConfigUseCase.js";
import { LdapAuthProvider } from "../infrastructure/auth/LdapAuthProvider.js";
import { UserSyncService } from "../infrastructure/services/UserSyncService.js";

import { GoogleOAuthClient } from "../infrastructure/services/GoogleOAuthClient.js";
import { LoginWithGoogleUseCase } from "../application/use-cases/LoginWithGoogleUseCase.js";
import { TestLdapConnectionUseCase } from "../application/use-cases/TestLdapConnectionUseCase.js";

import { PrismaGoogleUserRepository } from "../infrastructure/repositories/PrismaGoogleUserRepository.js";
import { LinkGoogleUserToTenantUseCase } from "../application/use-cases/LinkGoogleUserToTenantUseCase.js";



import { RegisterTenantAdminUseCase } from "../application/use-cases/RegisterTenantAdminUseCase.js";
import { LoginTenantAdminUseCase } from "../application/use-cases/LoginTenantAdminUseCase.js";
import { LoginEmployeeUseCase } from "../application/use-cases/LoginEmployeeUseCase.js";
import { GetMeUseCase } from "../application/use-cases/GetMeUseCase.js";

import { AuthController } from "../presentation/controllers/AuthController.js";
import { createAuthRoutes } from "../presentation/routes/authRoutes.js";

import { PrismaTenantHrIntegrationConfigRepository } from "../infrastructure/repositories/PrismaTenantHrIntegrationConfigRepository.js";
import { CreateHrIntegrationConfigUseCase } from "../application/use-cases/CreateHrIntegrationConfigUseCase.js";
import { GetHrIntegrationConfigUseCase } from "../application/use-cases/GetHrIntegrationConfigUseCase.js";

import { HrSyncService } from "../infrastructure/services/HrSyncService.js";
import { SyncHrIntegrationUseCase } from "../application/use-cases/SyncHrIntegrationUseCase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const tokenService = new TokenService(process.env.JWT_SECRET);
const passwordHashService = new BcryptPasswordHashService();

const userSyncService = new UserSyncService();
const tenantRepository = new PrismaTenantRepository();
const tenantAdminRepository = new PrismaTenantAdminRepository();
const tenantLdapConfigRepository = new PrismaTenantLdapConfigRepository();

const registerTenantAdminUseCase = new RegisterTenantAdminUseCase(
  tenantRepository,
  tenantAdminRepository,
  tenantLdapConfigRepository,
  passwordHashService,
  tokenService
);

const loginTenantAdminUseCase = new LoginTenantAdminUseCase(
  tenantRepository,
  tenantAdminRepository,
  passwordHashService,
  tokenService
);

const loginEmployeeUseCase = new LoginEmployeeUseCase(
  tenantRepository,
  tenantLdapConfigRepository,
  tokenService,
  (config) => new LdapAuthProvider(config),
  userSyncService
);

const ldapConfigRepository = new PrismaTenantLdapConfigRepository();

const createLdapConfigUseCase = new CreateLdapConfigUseCase(
  ldapConfigRepository
);

const googleOAuthClient = new GoogleOAuthClient();

const googleUserRepository = new PrismaGoogleUserRepository();

const loginWithGoogleUseCase = new LoginWithGoogleUseCase(
  googleOAuthClient,
  googleUserRepository
);

const linkGoogleUserToTenantUseCase = new LinkGoogleUserToTenantUseCase(
  googleUserRepository,
  tenantRepository
);

const hrIntegrationConfigRepository =
  new PrismaTenantHrIntegrationConfigRepository();

const hrSyncService = new HrSyncService();

const syncHrIntegrationUseCase = new SyncHrIntegrationUseCase(
  hrIntegrationConfigRepository,
  hrSyncService
);

const createHrIntegrationConfigUseCase =
  new CreateHrIntegrationConfigUseCase(hrIntegrationConfigRepository);

const getHrIntegrationConfigUseCase =
  new GetHrIntegrationConfigUseCase(hrIntegrationConfigRepository);

const testLdapConnectionUseCase = new TestLdapConnectionUseCase();

const getMeUseCase = new GetMeUseCase();

const authController = new AuthController(
  registerTenantAdminUseCase,
  loginTenantAdminUseCase,
  loginEmployeeUseCase,
  getMeUseCase,
  loginWithGoogleUseCase,
  linkGoogleUserToTenantUseCase,
  testLdapConnectionUseCase,
  createLdapConfigUseCase,
  createHrIntegrationConfigUseCase,
  getHrIntegrationConfigUseCase
);

app.use("/", createAuthRoutes(authController));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth Service rodando na porta ${PORT}`);
});