import { addBackupHandler } from '@masknet/plugin/worker'
import { Some } from 'ts-results'

addBackupHandler({
    async onBackup() {
        return Some({ hello: 'hi' })
    },
    async onRestore(data) {
        console.log(data)
    },
})
