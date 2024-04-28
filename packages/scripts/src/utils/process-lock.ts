// TODO: load this lazy
import Lock from 'proper-lockfile'
import { fileURLToPath } from 'url'

export async function getProcessLock(lockName: string) {
    const lockfilePath = getLockPosition(lockName)
    while (true) {
        if (isLocked(lockName)) {
            await new Promise((resolve) => setTimeout(resolve, 500))
        } else {
            try {
                Lock.lockSync(import.meta.filename, { lockfilePath, update: 200 })
                return
            } catch {
                // ignore
            }
        }
    }
}
export function isLocked(lockName: string) {
    const lockfilePath = getLockPosition(lockName)
    const result = Lock.checkSync(import.meta.filename, { lockfilePath, stale: 500 })
    return result
}

function getLockPosition(lockName: string) {
    const lockfilePath = new URL(`${lockName}.lock.log`, import.meta.url)
    return fileURLToPath(lockfilePath)
}
