import path from 'path'
import { check, lock } from 'proper-lockfile'
import { delay } from './utils'

const lockfilePath = path.join(__dirname, 'lockfile.log')

export default async function* () {
    while (true) {
        if (!(await check(__filename, { lockfilePath }))) {
            yield locker
        }
        await delay(2000)
    }

    function locker() {
        return new Promise<boolean>(async (resolve) => {
            await lock(__filename, {
                lockfilePath,
                onCompromised: () => resolve(false),
            })
            resolve(true)
        })
    }
}
