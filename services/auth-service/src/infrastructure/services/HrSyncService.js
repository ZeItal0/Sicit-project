import dotenv from "dotenv";

dotenv.config();

export class HrSyncService {
  async fetchFromHr({ config }) {
    const headers = {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    };

    const [employees, sectors, roles] = await Promise.all([
      config.syncEmployees
        ? this.fetchJson(`${config.apiUrl}${config.employeesEndpoint}`, headers)
        : [],
      config.syncSectors
        ? this.fetchJson(`${config.apiUrl}${config.sectorsEndpoint}`, headers)
        : [],
      config.syncRoles
        ? this.fetchJson(`${config.apiUrl}${config.rolesEndpoint}`, headers)
        : [],
    ]);

    return {
      employees: this.normalizeEmployees(employees),
      sectors: this.normalizeSectors(sectors),
      roles: this.normalizeRoles(roles),
    };
  }

  async sendToUserService({ tenantId, data }) {
    const response = await fetch(`${process.env.USER_SERVICE_URL}/internal/hr/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        tenantId,
        employees: data.employees,
        sectors: data.sectors,
        roles: data.roles,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.message || "Erro ao sincronizar dados no user-service");
    }

    return result;
  }

  async fetchJson(url, headers) {
    const response = await fetch(url, { headers });

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do RH: ${url}`);
    }

    return Array.isArray(data) ? data : data.data || data.items || [];
  }

  normalizeEmployees(employees) {
    return employees.map((employee) => ({
      externalId: String(employee.id || employee.employeeId || employee.code || employee.email),
      name: employee.name || employee.fullName || employee.employeeName,
      email: employee.email || employee.workEmail,
      sectorExternalId: employee.departmentId || employee.sectorId,
      sectorName: employee.department || employee.departmentName || employee.sector,
      roleExternalId: employee.jobId || employee.roleId || employee.positionId,
      roleName: employee.jobTitle || employee.role || employee.position,
    }));
  }

  normalizeSectors(sectors) {
    return sectors.map((sector) => ({
      externalId: String(sector.id || sector.departmentId || sector.code || sector.name),
      name: sector.name || sector.departmentName || sector.title,
      description: sector.description || "Sincronizado do RH",
    }));
  }

  normalizeRoles(roles) {
    return roles.map((role) => ({
      externalId: String(role.id || role.jobId || role.code || role.name),
      name: role.name || role.jobTitle || role.title,
      description: role.description || "Sincronizado do RH",
    }));
  }
}