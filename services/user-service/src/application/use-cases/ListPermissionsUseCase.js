export class ListPermissionsUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute() {
    return this.permissionRepository.findAll();
  }
}