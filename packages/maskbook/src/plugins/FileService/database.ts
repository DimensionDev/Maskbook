import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { asyncIteratorToArray } from '../../utils/type-transform/asyncIteratorHelpers'
import { identifier } from './constants'
import type { FileInfo } from './types'

type TaggedTypes = FileInfo

const Database = createPluginDatabase<TaggedTypes>(identifier)

export async function getRecentFiles() {
    const files: FileInfo[] = await asyncIteratorToArray(Database.iterate('arweave'))
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return files.slice(0, 4)
}

export async function getFileInfo(checksum: string) {
    return Database.get('arweave', checksum)
}

export async function setFileInfo(info: FileInfo) {
    return Database.add(info)
}
