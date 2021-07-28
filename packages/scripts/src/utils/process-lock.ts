import path from 'path'
import Lock from 'proper-lockfile'

export async function getProcessLock(lockName: string) {
    const lockfilePath = getLockPosition(lockName)
    while (true) {
        if (isLocked(lockName)) {
            await new Promise((resolve) => setTimeout(resolve, 500))
        } else {
            try {
                Lock.lockSync(__filename, { lockfilePath, update: 200 })
                return
            } catch (e) {}
        }
    }
}
export function isLocked(lockName: string) {
    const lockfilePath = getLockPosition(lockName)
    const result = Lock.checkSync(__filename, { lockfilePath, stale: 500 })
    return result
}

function getLockPosition(lockName: string) {
    const lockfilePath = path.join(__dirname, `${lockName}.lock.log`)
    return lockfilePath
}
