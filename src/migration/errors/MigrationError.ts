export abstract class MigrationError extends Error {
  abstract name: string

  toString() {
    return `${this.name}: ${this.message}`
  }
}