import { CrossIsolationMessages } from '@masknet/shared-base'
import { walletDatabase } from '../../../database/Plugin.db.js'

const DEFAULT_LOCK_DURATION = 1000 * 60 * 60 * 24 // One day

const ID = 'locker'

export interface LockerRecord {
    type: 'locker'
    id: string
    duration: number // ms
}

async function getAutoLockerRecord() {
    return walletDatabase.get('locker', ID)
}

export async function getAutoLockerDuration() {
    const record = await getAutoLockerRecord()
    return record?.duration ?? DEFAULT_LOCK_DURATION
}

export async function setAutoLockerTime(duration: number) {
    await walletDatabase.add({ type: 'locker', id: ID, duration })
    CrossIsolationMessages.events.walletLockTimeUpdated.sendToAll()
}
