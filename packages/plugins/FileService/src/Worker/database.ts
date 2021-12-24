import type { Plugin } from '@masknet/plugin-infra'
import { FileInfoV1ToV2 } from '../helpers'
import type { FileInfo, FileInfoV1 } from '../types'

type DatabaseTypes = FileInfo | FileInfoV1

let Database: Plugin.Worker.DatabaseStorage<DatabaseTypes>

export function setupDatabase(_: typeof Database) {
    Database = _
}

let migrationDone = false
async function migrationV1_V2() {
    if (migrationDone) return
    for await (const x of Database.iterate_mutate('arweave')) {
        await Database.add(FileInfoV1ToV2(x.value))
        await x.delete()
    }
    migrationDone = true
}

export async function getAllFiles() {
    await migrationV1_V2()
    const files: FileInfo[] = []
    for await (const { value } of Database.iterate('file')) {
        files.push(value)
    }
    return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getRecentFiles() {
    const files = await getAllFiles()
    return files.slice(0, 4)
}

export async function getFileInfo(checksum: string) {
    await migrationV1_V2()
    return Database.get('file', checksum)
}

export async function setFileInfo(info: FileInfo) {
    await migrationV1_V2()
    return Database.add(info)
}
