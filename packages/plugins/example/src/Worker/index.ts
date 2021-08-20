import type { Plugin } from '@masknet/plugin-infra'
// import { Ok, Some } from '@masknet/plugin-infra'
import { base } from '../base'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal) {
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
export default worker
