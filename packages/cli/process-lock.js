const properLock = require('proper-lockfile')
const path = require('path')
const lockfilePath = path.join(__dirname, './lockfile.log')

function delay(ms) {
    return new Promise((r) => setTimeout(r, ms))
}
module.exports = async function* () {
    while (true) {
        if (!(await properLock.check(__filename, { lockfilePath }))) yield lock
        await delay(2000)
    }

    /** @returns {Promise<boolean>} */
    function lock() {
        return new Promise((resolve) => {
            properLock
                .lock(__filename, {
                    onCompromised: () => resolve(false),
                    lockfilePath,
                })
                .then(() => resolve(true))
        })
    }
}
