import * as webExt from 'web-ext'
import { chromeProfile, firefoxProfile, output } from './paths'
import inquirer from 'inquirer'
import { named } from './helper'

type CmdRunParams = Parameters<typeof webExt.cmd.run>[0]
type CmdRunOptions = Parameters<typeof webExt.cmd.run>[1]
export async function loadChrome() {
    chromeProfile.ensure()
    console.log('Starting Chrome...')
    await webExt.cmd.run(
        {
            target: ['chromium'],
            sourceDir: output.extension.folder,
            keepProfileChanges: true,
            chromiumProfile: chromeProfile.folder,
            noReload: true,
        } as CmdRunParams,
        { shouldExitProgram: false } as CmdRunOptions,
    )
}
named('open-ch', 'Open Chrome and Install the extension.', loadChrome)
export async function loadFirefox() {
    firefoxProfile.ensure()
    console.log('Starting Firefox...')
    await webExt.cmd.run(
        {
            target: ['firefox-desktop'],
            sourceDir: output.extension.folder,
            keepProfileChanges: true,
            firefoxProfile: firefoxProfile.folder,
            noReload: true,
            firefox: 'firefoxdeveloperedition',
        } as CmdRunParams,
        { shouldExitProgram: true } as CmdRunOptions,
    )
}
named('open-fx', 'Open Firefox and Install the extension.', loadFirefox)
export async function loadFirefoxAndroid() {
    console.log('Starting Firefox for Android...')
    console.log(
        'Please make sure you follow the guide in the https://developer.mozilla.org/en-US/docs/Tools/about:debugging#Connecting_to_a_remote_device',
    )
    const options = {
        target: ['firefox-android'],
        sourceDir: output.extension.folder,
        noReload: true,
        firefoxApk: 'org.mozilla.firefox',
    } as CmdRunParams
    const opt2 = { shouldExitProgram: true } as CmdRunOptions
    if (!options.adbDevice) options.adbDevice = await connectADB(options, opt2)
    await webExt.cmd.run(options, opt2)
}
named('open-fx-a', 'Open Firefox for Android and Install the extension.', loadFirefoxAndroid)
type L = typeof webExt.util.consoleStream
function connectADB(opt: CmdRunParams, opt2: CmdRunOptions) {
    const log = (webExt.util as any).logger.consoleStream as L
    const orig = log.write
    return new Promise<string>(async (resolve, reject) => {
        log.write = (...args) => {
            const raw = args[0].msg
            const message = (raw || '').trim().split('\n')
            if (message[0] !== 'Android devices found:') return console.log(raw)
            const devices = message.slice(1).map((s) => s.substr(3))
            if (devices.length === 1) {
                console.log('Selecting Android device ' + devices[0])
                return resolve(devices[0])
            }
            inquirer
                .prompt({
                    type: 'list',
                    choices: devices,
                    name: 'device',
                    message: 'Select a device',
                })
                .then((ans) => resolve(ans.device))
        }
        webExt.cmd.run(opt, opt2).catch(() => {})
    }).finally(() => (log.write = orig))
}
