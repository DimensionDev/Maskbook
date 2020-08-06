import inquirer from 'inquirer'
import { setEnv } from './env'
import { output } from './paths'
import {
    build as buildTask,
    hmrServer,
    watchAssets,
    watchEnvironmentFile,
    watchManifest,
    watchSrcAssets,
} from './index'
import { multiProcess, named, parallelL } from './helper'
import { loadChrome, loadFirefox, loadFirefoxAndroid } from './web-ext-cli'
import type { TaskFunction } from 'gulp'
import { tscESModuleWatch, tscSystemWatch, watchCopyESMOut } from './tsc'
import { dependenciesWatch } from './dependencies'
import { isolatedWatch } from './build-isolated'
import { workerWatch } from './build-worker'
export async function interactiveWatch() {
    const { build, init, open, target } = await question()
    setEnv(getTarget(target))
    if (init) {
        try {
            await buildTask()
        } catch (e) {
            console.error(e)
            console.log('Error in init build. You may want to fix and rebuild them before continue.')
        }
    }
    if (open) {
        if (target === Target.FirefoxAndroid) loadFirefoxAndroid()
        if (target === Target.Firefox) loadFirefox()
        if (target === Target.Chrome) loadChrome()
    }
    console.log('Starting incremental build')
    const list: TaskFunction[] = [watchSrcAssets, watchManifest, watchEnvironmentFile, watchAssets, hmrServer]
    const multiProcessTasks: TaskFunction[] = []
    if (build.includes(Build.ESM)) {
        multiProcessTasks.push(tscESModuleWatch)
        list.push(watchCopyESMOut)
    }
    if (build.includes(Build.System)) multiProcessTasks.push(tscSystemWatch)
    if (build.includes(Build.Dependencies)) multiProcessTasks.push(dependenciesWatch)
    if (build.includes(Build.IsolatedBuild)) multiProcessTasks.push(isolatedWatch)
    if (build.includes(Build.WebWorkers)) multiProcessTasks.push(workerWatch)
    const task = parallelL('Watch', ...list, multiProcess(multiProcessTasks))
    task.setRenderer('silent')
    return task.run()
}
named('interactive-watch', 'Start interactive watch', interactiveWatch)

async function question() {
    const { target }: { target: Target } = await inquirer.prompt({
        type: 'list',
        name: 'target',
        message: 'What target you are build for?',
        default: 'chrome',
        choices: [
            { value: Target.Chrome, name: 'Chromium' },
            { value: Target.Firefox, name: 'Firefox' },
            { value: Target.FirefoxAndroid, name: 'Firefox for Android' },
            { value: Target.iOS, name: 'iOS App' },
            { value: Target.Android, name: 'Android App' },
        ],
    })
    const { build }: { build: Build[] } = await inquirer.prompt({
        type: 'checkbox',
        name: 'build',
        message: 'What do you want to build and watch?',
        choices: [
            { value: Build.ESM, name: 'Source files (src/*) as ESModule', checked: true, short: 'ESModule' },
            {
                value: Build.System,
                name: 'Source files (src/*) as SystemJS (for Firefox)',
                checked: isFx(target),
                short: 'System',
            },
            { value: Build.WebWorkers, name: 'Web Workers', checked: false, short: 'Workers' },
            { value: Build.Dependencies, name: 'Dependencies (node_modules/*)', checked: true, short: 'node_modules' },
            { value: Build.IsolatedBuild, name: 'Injected Script', checked: false, short: 'Injected' },
        ],
    })
    const { init }: { init: boolean } = await (output.extension.existsSync()
        ? inquirer.prompt({
              type: 'confirm',
              name: 'init',
              message: `Do you want to start a full build before incremental build?`,
              default: false,
          })
        : Promise.resolve({ init: true }))
    const { open }: { open: boolean } = await (target === Target.iOS || target === Target.Android
        ? Promise.resolve({ open: false })
        : inquirer.prompt({
              type: 'confirm',
              name: 'open',
              message: `Do you want to start a debugging session for ${Target[target]}?`,
          }))
    return { target, build, init, open }
}

enum Build {
    ESM,
    System,
    WebWorkers,
    IsolatedBuild,
    Dependencies,
}

function isFx(x: Target) {
    if (x === Target.Firefox) return true
    if (x === Target.FirefoxAndroid) return true
    if (x === Target.Android) return true
    return false
}

function getTarget(x: Target): Parameters<typeof setEnv>[0] {
    switch (x) {
        case Target.Android:
            return { arch: 'app', fx: 'geckoview', resolution: 'mobile', target: 'firefox' }
        case Target.Firefox:
            return { arch: 'web', fx: 'fennec', resolution: 'desktop', target: 'firefox' }
        case Target.FirefoxAndroid:
            return { arch: 'web', fx: 'fennec', resolution: 'mobile', target: 'firefox' }
        case Target.Chrome:
            return { arch: 'web', resolution: 'desktop', target: 'chromium' }
        case Target.iOS:
            return { arch: 'app', resolution: 'mobile', target: 'safari' }
    }
}
enum Target {
    Chrome,
    Firefox,
    FirefoxAndroid,
    iOS,
    Android,
}
