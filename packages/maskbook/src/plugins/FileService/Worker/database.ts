import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../../utils/type-transform/asyncIteratorHelpers'
import { base } from '../base'
import { FileInfoV1ToV2 } from '../helpers'
import type { FileInfo, FileInfoV1 } from '../types'

type TaggedTypes = FileInfo | FileInfoV1

const Database = createPluginDatabase<TaggedTypes>(base.ID)

let migrationDone = false
async function migrationV1_V2() {
    if (migrationDone) return
    for await (const x of Database.iterate_mutate('arweave')) {
        await Database.add(FileInfoV1ToV2(x.data))
        await x.delete()
    }
    migrationDone = true
}

export async function getAllFiles() {
    await migrationV1_V2()
    const files: FileInfo[] = await asyncIteratorToArray(Database.iterate('file'))
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
