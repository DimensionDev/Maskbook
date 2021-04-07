import path from 'path'
import Lock from 'proper-lockfile'
import { delay } from '../utils'

const lockfilePath = path.join(__dirname, 'lockfile.log')

export default async function* () {
    while (true) {
        if (!(await isLocked())) {
            yield locker
        }
        await delay(2000)
    }
}
export function isLocked() {
    return Lock.check(__filename, { lockfilePath })
}

function locker() {
    return new Promise<boolean>(async (resolve) => {
        await Lock.lock(__filename, {
            lockfilePath,
            onCompromised: () => resolve(false),
        })
        resolve(true)
    })
}
