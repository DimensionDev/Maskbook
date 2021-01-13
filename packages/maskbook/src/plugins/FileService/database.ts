import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../utils/type-transform/asyncIteratorHelpers'
import { identifier } from './constants'
import { FileInfoV1ToV2 } from './define'
import type { FileInfo, FileInfoV1 } from './types'

type TaggedTypes = FileInfo | FileInfoV1

const Database = createPluginDatabase<TaggedTypes>(identifier)

let migrationDone = false
async function migrationV1_V2() {
    if (migrationDone) return
    for await (const x of Database.iterate_mutate('arweave')) {
        await Database.add(FileInfoV1ToV2(x.data))
        await x.delete()
    }
    migrationDone = true
}

export async function getRecentFiles() {
    await migrationV1_V2()
    const files: FileInfo[] = await asyncIteratorToArray(Database.iterate('file'))
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
