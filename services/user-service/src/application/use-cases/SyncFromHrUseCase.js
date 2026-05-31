export class SyncFromHrUseCase {
  constructor(userRepository, sectorRepository, roleRepository) {
    this.userRepository = userRepository;
    this.sectorRepository = sectorRepository;
    this.roleRepository = roleRepository;
  }

  async execute({ tenantId, employees = [], sectors = [], roles = [] }) {
    if (!tenantId) {
      throw new Error("tenantId obrigatório");
    }

    const syncedSectors = [];
    const syncedRoles = [];
    const syncedUsers = [];

    const sectorMap = new Map();
    const roleMap = new Map();

    for (const sector of sectors) {
      if (!sector.name) continue;

      const existing = await this.sectorRepository.findByNameAndTenantId(
        sector.name,
        tenantId
      );

      const saved =
        existing ||
        (await this.sectorRepository.create({
          tenantId,
          name: sector.name,
          description: sector.description || "Sincronizado do RH",
        }));

      sectorMap.set(sector.externalId || sector.name, saved);
      syncedSectors.push(saved);
    }

    for (const role of roles) {
      if (!role.name) continue;

      const existing = await this.roleRepository.findByNameAndTenantId(
        role.name,
        tenantId
      );

      const saved =
        existing ||
        (await this.roleRepository.create({
          tenantId,
          name: role.name,
          description: role.description || "Sincronizado do RH",
        }));

      roleMap.set(role.externalId || role.name, saved);
      syncedRoles.push(saved);
    }

    for (const employee of employees) {
      if (!employee.name || !employee.email) continue;

      const sector =
        sectorMap.get(employee.sectorExternalId) ||
        sectorMap.get(employee.sectorName);

      const role =
        roleMap.get(employee.roleExternalId) ||
        roleMap.get(employee.roleName);

      const saved = await this.userRepository.syncFromHr({
        tenantId,
        name: employee.name,
        email: employee.email,
        externalId: employee.externalId || employee.email,
        sectorId: sector?.id || null,
        roleId: role?.id || null,
      });

      syncedUsers.push(saved);
    }

    return {
      message: "Sincronização com RH concluída",
      synced: {
        sectors: syncedSectors.length,
        roles: syncedRoles.length,
        users: syncedUsers.length,
      },
      sectors: syncedSectors,
      roles: syncedRoles,
      users: syncedUsers,
    };
  }
}