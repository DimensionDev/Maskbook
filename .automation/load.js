const { exitAll, step, waitCompile } = require('./util')

const { task, logger } = require('just-task')
const args = require('just-task').argv()
const adb = require('adbkit').createClient()
const path = require('path')
const fs = require('fs-extra')

task('load/firefox', () => firefox())
task('load/firefox/android', () => android())

const profile = path.join(process.cwd(), `.firefox`)

const firefox = async () => {
    if (!(await fs.pathExists(profile)) || args.fresh) {
        try {
            const timestamp = Date.now().toString()
            await step(['firefox', '-CreateProfile', `"${timestamp} ${path.join(profile, timestamp)}"`])
        } catch {
            throw new Error('Cannot locate or create a profile for firefox. Add firefox to your PATH.')
        }
        if (args.fresh) {
            logger.warn('new profile generated. old firefox profile cleanable by command "firefox -P".')
        }
    }
    await waitCompile()
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
}

const android = async () => {
    logger.warn("This function is not fully tested and not guaranteed it is working.")
    await waitCompile()
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
}
