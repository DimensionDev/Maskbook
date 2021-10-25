import type { Plugin } from '@masknet/plugin-infra'
// import { Ok, Some } from '@masknet/plugin-infra'
import { base } from '../base'

interface File {
    type: 'file'
    id: string
    filename: string
}
interface Folder {
    type: 'folder'
    id: string
    files: File['id'][]
}
let storage: Plugin.Worker.Storage<File | Folder> | undefined
const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        storage = context.getStorage()
        console.debug('Example plugin installed on the background')
        signal.addEventListener('abort', () => console.debug('Example plugin stopped'))
    },
    // backup: {
    //     async onBackup() {
    //         return Some({ message: 'my backup!', version: 1 })
    //     },
    //     async onRestore(obj) {
    //         console.log('Example plugin receives a backup', obj)
    //         return Ok.EMPTY
    //     },
    // },
}

async function test() {
    if (!storage) return // plugin not started
    for await (const cursor of storage.iterate('file')) {
        cursor.value.filename
    }
}
export default worker
