// TODO: this type should be imported from the shared repo.
export interface BackupHandler {
    onBackup(): unknown
    onRestore(data: unknown): unknown
}
