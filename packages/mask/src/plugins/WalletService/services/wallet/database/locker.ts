import { CrossIsolationMessages } from '@masknet/shared-base'
import { PluginDB } from '../../../database/Plugin.db.js'

const DEFAULT_LOCK_DURATION = 1000 * 60 * 15 // 15 mins

const ID = 'locker'

export type LockerRecord = {
    type: 'locker'
    id: string
    duration: number // ms
}

async function getAutoLockerRecord() {
    return PluginDB.get('locker', ID)
}

export async function getAutoLockerDuration() {
    const record = await getAutoLockerRecord()
    return record?.duration ?? (record?.duration === 0 ? 0 : DEFAULT_LOCK_DURATION)
}

export async function setAutoLockerTime(duration: number) {
    await PluginDB.add({ type: 'locker', id: ID, duration })
    CrossIsolationMessages.events.walletLockTimeUpdated.sendToAll()
}
