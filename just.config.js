const { task, series, parallel } = require('just-task')
const args = require('just-task').argv()
const { spawn, exec } = require('child_process')
const { watch } = require('chokidar')
const adb = require('adbkit').createClient()
const path = require('path')
const fs = require('fs-extra')

const profile = path.join(process.cwd(), `.firefox`)

const prettierCommand = async (str, level = 'log') => {
    await step(['prettier', `--${str}`, './src/**/*.{ts,tsx}', '--loglevel', level])
}
const eslintCommand = ['eslint', '--ext', 'tsx,ts', './src/', '--cache']

task('watch', () => series('react'))
/**
 * @cli-argument fresh {boolean} use a new profile to start over.
 */
task('watch/firefox', () => parallel('react', 'load/firefox'))
task('watch/android', () => parallel('react', 'load/firefox/android'))

task('react', () => parallel('lint/fix', 'react/start'))
task('react/start', () => step(['react-app-rewired', 'start']))
task('react/build', () => step(['react-app-rewired', 'build']))
task('react/test', () => step(['react-app-rewired', 'test']))

const prompt = () => console.log('[web-ext] assuming built, starting hot reload service')

task('load/firefox', async () => {
    if (!(await fs.pathExists(profile)) || args.fresh) {
        try {
            const timestamp = Date.now().toString()
            await step(['firefox', '-CreateProfile', `"${timestamp} ${path.join(profile, timestamp)}"`])
        } catch {
            throw new Error('Cannot locate or create a profile for firefox. Add firefox to your PATH.')
        }
        if (args.fresh) {
            console.warn('new profile generated. old firefox profile cleanable by command "firefox -P".')
        }
    }
    await fs.remove('./dist')
    await untilDirChanged('./dist')
    prompt()
    const latestProfile = path.join(profile, last(await fs.readdir(profile)))
    await step([
        'web-ext',
        'run',
        `--firefox-profile=${latestProfile}`,
        '--keep-profile-changes',
        '--source-dir',
        './dist/',
    ])
    exitAll()
})
task('load/firefox/android', async () => {
    await fs.remove('./dist')
    await untilDirChanged('./dist')
    prompt()
    const list = adb.listDevices()
    const device = (() => {
        if (list.length === 1) {
            return list[0]['id']
        }
        return args['android-device']
    })()
    if (device) {
        await step([
            'web-ext',
            'run',
            args.refresh ? '' : '--keep-profile-changes',
            '--target=firefox-android',
            '--source-dir',
            './dist/',
            `--android-device=${device}`,
        ])
    } else {
        throw new Error('[web-ext] no device specified, exiting')
    }
    exitAll()
})

task('lint', () => parallel('lint/prettier', 'lint/eslint'))
task('lint/fix', () => parallel('lint/prettier/fix', 'lint/eslint/fix'))
task('lint/prettier', () => prettierCommand('check'))
task('lint/prettier/fix', () => prettierCommand('write', 'warn'))
task('lint/eslint', () => step(eslintCommand))
task('lint/eslint/fix', () => step(eslintCommand.concat('--fix')))

task('storybook', () => parallel('lint/fix', 'storybook/serve'))
task('storybook/serve', () => step(['start-storybook', '-p', '9009', '-s', 'public', '--quiet'], { withWarn: true }))
task('storybook/build', () => step(['build-storybook', '-s', 'public', '--quiet'], { withWarn: true }))

task('install', () => series('install/holoflows'))
task('install/holoflows', async () => {
    if (args.upgrade) {
        await step(['yarn', 'upgrade', '@holoflows/kit'])
    }
    const dir = { cwd: path.join(process.cwd(), 'node_modules/@holoflows/kit') }
    await step(['yarn'], dir)
    await step(['yarn', 'build'], dir)
})

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
