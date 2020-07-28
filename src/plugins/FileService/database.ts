import { createPluginDatabase } from '../../database/Plugin/wrap-plugin-database'
import { identifier } from './constants'
import type { FileInfo } from './types'

type TaggedTypes = FileInfo

const Database = createPluginDatabase<TaggedTypes>(identifier)

export async function getRecentFiles() {
    const files: FileInfo[] = []
    for await (const file of Database.iterate('arweave')) {
        files.push(file)
    }
    console.log(files)
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return files.slice(0, 4)
}

export async function getFileInfo(checksum: string) {
    return Database.get('arweave', checksum)
}

export async function setFileInfo(info: FileInfo) {
    return Database.set('arweave', info)
}
