import type { Plugin } from '@masknet/plugin-infra'
import { compareDesc } from 'date-fns'
import { migrateFileInfoV1 } from '../helpers.js'
import type { FileInfo, FileInfoV1 } from '../types.js'

type DatabaseTypes = FileInfo | FileInfoV1

let Database: Plugin.Worker.DatabaseStorage<DatabaseTypes>

export function setupDatabase(_: typeof Database) {
    Database = _
}

let migrationDone = false
async function migrationV1() {
    if (!Database) return
    if (migrationDone) return
    for await (const x of Database.iterate_mutate('arweave')) {
        for (const file of migrateFileInfoV1(x.value)) {
            await Database.add({
                ...file,
                createdAt: typeof file.createdAt !== 'number' ? new Date(file.createdAt).getTime() : file.createdAt,
            })
        }
        await x.delete()
    }
    migrationDone = true
}

export async function getAllFiles() {
    await migrationV1()
    const files: FileInfo[] = []
    for await (const { value } of Database.iterate('file')) {
        files.push(value)
    }
    return files.sort((a, b) => compareDesc(new Date(a.createdAt), new Date(b.createdAt)))
}

export async function setFileInfo(info: FileInfo) {
    await migrationV1()
    return Database.add(info)
}

export async function renameFile(id: string, newName: string) {
    const file = await Database.get('file', id)
    if (!file) throw new Error("File to rename doesn't exist")
    await Database.remove('file', id)
    Database.add({ ...file, name: newName })
}

export async function deleteFile(id: string) {
    await Database.remove('file', id)
}
