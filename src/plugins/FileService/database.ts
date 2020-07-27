import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { identifier } from './constants'
import type { FileInfo } from './types'

type TaggedTypes = FileInfo

const Database = createPluginDatabase<TaggedTypes>(identifier)

export async function getRecentFiles() {
    const files: FileInfo[] = []
    let count = 0
    for await (const file of Database.iterate('arweave')) {
        files.push(file)
        if (count > 4) {
            break
        }
        count += 1
    }
    return files
}

export async function getFileInfo(checksum: string) {
    return Database.get('arweave', checksum)
}

export async function setFileInfo(info: FileInfo) {
    return Database.set('arweave', info)
}
