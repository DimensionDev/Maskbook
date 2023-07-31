import { CrossIsolationMessages } from '@masknet/shared-base'
import { PluginDB } from '../../../database/Plugin.db.js'

const DEFAULT_LOCK_TIME = 1000 * 60 * 15 // 15 mins

const ID = 'unlock-time'

export type LockerRecord = {
    type: 'unlock-time'
    id: string
    time: number // ms
}

async function getAutoLockerRecord() {
    return PluginDB.get('unlock-time', ID)
}

export async function getAutoLockerTime() {
    const record = await getAutoLockerRecord()
    return record?.time ?? DEFAULT_LOCK_TIME
}

export async function setAutoLockerTime(time: number) {
    await PluginDB.add({ type: 'unlock-time', id: ID, time })
    CrossIsolationMessages.events.walletLockTimeUpdated.sendToAll()
}
