export class Permission {
  constructor({ id, code, name, description = null }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.description = description;
  }
}