const { spawn, exec } = require('child_process')
const { watch } = require('chokidar')
const fs = require('fs-extra')

const stepChild = []
/**
 * @param cmd {string | string[]} The command you want to run
 * @param [opt] {import('child_process').SpawnOptions & { withWarn?: boolean }} Options
 */
const step = (cmd, opt = { withWarn: process.env.CI === 'true' }) => {
    if (!Array.isArray(cmd)) cmd = [cmd]
    const child = spawn(cmd[0], cmd.splice(1), {
        // This is unfortunately required for *.cmd to be ran as commands
        shell: true,
        stdio: ['inherit', 'inherit', opt.withWarn ? 'inherit' : 'ignore'],
        // We only need a new process group on *nix; having a new console on win32 is useless
        detached: process.platform !== 'win32',
        ...opt,
    })

    stepChild.push(child)
    const off = () => pull(stepChild, [child])

    return new Promise((resolve, reject) => {
        child.on('error', () => {
            off()
            reject()
        })

        child.on('exit', code => {
            off()
            if (code === 0) {
                resolve()
            } else {
                const err = new Error(`child exited with code ${code}`)
                reject(err)
            }
        })
    })
}

/**
 * Kill a process and its subprocesses. It kills the entire process group
 * on *nix systems, and therefore can only handle non-detached subprocesses of
 * the current process. On Linux cgroups may be able to do it better. On Windows,
 * taskkill /T seems to only deal with one layer of subprocessing too.
 * {@link https://docs.microsoft.com/en-us/sysinternals/downloads/pskill|pskill} -t
 * would be a better solution, but not everyone has pstools installed.
 *
 * @see {@link https://unix.stackexchange.com/questions/124127}
 * @summary Kill a process and its subprocesses.
 * @param pid {number}
 * @param [sig] {string | number}
 */
const killTree = (pid, sig) => {
    if (process.platform === 'win32') {
        return exec(`taskkill /pid ${pid} /T /F`);
    } else {
        // kill(2): Negative numbers are equivalent to killpg(2)
        return process.kill(-pid, sig)
    }
}

/**
 * @desc this method kill all process spawned by function 'spawn'.
 *
 * By tests, npm script manager actually has ability to kill
 * all process spawned by node even detached.
 * We recommended that do not running just tasks directly,
 * instead, use npm scripts.
 */
const exitAll = () => {
    /**
     * @type stepChild {import('child_process').ChildProcess[]}
     */
    while(stepChild.length > 0) {
        killTree(stepChild.pop().pid)
    }
    process.exit(0)
}

const untilDirChanged = (dir = '.', timeout = 4000) => {
    return new Promise(resolve => {
        let last = undefined
        watch(dir).on('all', () => {
            if (last) {
                clearTimeout(last)
            }
            last = setTimeout(resolve, timeout)
        })
    })
}

const last = array => {
    const length = array == null ? 0 : array.length
    return length ? array[length - 1] : undefined
}

const pull = (array, element) => {
    array.splice(array.findIndex(o => o === element), 1)
}

const waitCompile = async () => {
    await fs.remove('./dist')
    await untilDirChanged('./dist')
    console.log('[web-ext] assuming built, starting hot reload service')
}

module.exports = {
    step, last, exitAll, waitCompile
}
