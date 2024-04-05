import { MigrationError } from "./MigrationError";

export class SidecarFileNotFoundError extends MigrationError {
  name = 'SidecarFileNotFoundError'
  
  constructor(public readonly mediaFilePath: string) {
    super(`Google Photos sidecar file (JSON) not found for ${mediaFilePath}`)
  }
}