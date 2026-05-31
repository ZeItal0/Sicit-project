import crypto from "crypto";
import { Tenant } from "../../domain/entities/Tenant.js";
import { TenantAdmin } from "../../domain/entities/TenantAdmin.js";
import { TenantLdapConfig } from "../../domain/entities/TenantLdapConfig.js";

export class RegisterTenantAdminUseCase {
  constructor(
    tenantRepository,
    tenantAdminRepository,
    tenantLdapConfigRepository,
    passwordHashService,
    tokenService
  ) {
    this.tenantRepository = tenantRepository;
    this.tenantAdminRepository = tenantAdminRepository;
    this.tenantLdapConfigRepository = tenantLdapConfigRepository;
    this.passwordHashService = passwordHashService;
    this.tokenService = tokenService;
  }

  async execute(data) {
    const {
      name,
      email,
      password,
      companyName,
      domain,
      ldapUrl,
      baseDn,
      bindDn,
      bindPassword,
      userAttribute
    } = data;

    if (!name || !email || !password || !companyName || !domain) {
      throw new Error("Campos obrigatórios não informados");
    }

    const existingTenant = await this.tenantRepository.findByDomain(domain);
    if (existingTenant) {
      throw new Error("Domínio já cadastrado");
    }

    const tenant = new Tenant({
      id: crypto.randomUUID(),
      companyName,
      domain
    });

    await this.tenantRepository.create(tenant);

    const passwordHash = await this.passwordHashService.hash(password);

    const admin = new TenantAdmin({
      id: crypto.randomUUID(),
      tenantId: tenant.id,
      name,
      email,
      passwordHash
    });

    await this.tenantAdminRepository.create(admin);

    if (ldapUrl && baseDn && bindDn && bindPassword) {
      const ldapConfig = new TenantLdapConfig({
        id: crypto.randomUUID(),
        tenantId: tenant.id,
        ldapUrl,
        baseDn,
        bindDn,
        bindPassword,
        userAttribute: userAttribute || "uid"
      });

      await this.tenantLdapConfigRepository.create(ldapConfig);
    }

    const token = this.tokenService.generate({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      tenantId: tenant.id
    });

    return {
      message: "Tenant e admin cadastrados com sucesso",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        tenantId: tenant.id
      }
    };
  }
}