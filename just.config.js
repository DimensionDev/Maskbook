const { task, series, parallel } = require('just-task')
const { spawn } = require('child_process')
const { watch } = require('chokidar')
const adb = require('adbkit').createClient()
const path = require('path')
const fs = require('fs-extra')

const prettierCommand = async (str, level = 'log') => {
    const listen = 'onchange "./src/**/*" -i --'
    await step(`${listen} prettier --${str} "./src/**/*.{ts,tsx}" --loglevel ${level}`)
}
const eslintCommand = 'eslint --ext tsx,ts ./src/ --cache'

task('watch', () => series('react'))
task('watch/firefox', () => parallel('react', 'load/firefox'))
task('watch/android', () => parallel('react', 'load/firefox/android'))

task('react', () => parallel('lint/fix', 'react/start'))
task('react/start', () => step('react-app-rewired start'))
task('react/build', () => step('react-app-rewired build'))
task('react/test', () => step('react-app-rewired test'))

task('storybook', () => parallel('lint/fix', 'storybook/serve'))
task('storybook/serve', () => step('start-storybook -p 9009 -s public --quiet'))
task('storybook/build', () => step('build-storybook -s public --quiet'))

const prompt = () => console.log('[web-ext] assuming built, starting hot reload service')

task('load/firefox', async () => {
    await fs.remove('./dist')
    await untilDirChanged('./dist')
    prompt()
    await step('web-ext run --source-dir ./dist/')
    process.exit(0);
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
        const i = process.argv.findIndex(v => v === '--android-device')
        if (i > -1) {
            return process.argv[i + 1]
        }
    })()
    if (device) {
        await step(`web-ext run --target=firefox-android --source-dir ./dist/ --android-device=${device}`)
    } else {
        throw new Error('[web-ext] no device specified, exiting')
    }
    process.exit(0);
})

task('lint', () => prettierCommand('check'))
task('lint/fix', () => parallel('lint/prettier/fix', 'lint/eslint/fix'))
task('lint/prettier/fix', () => prettierCommand('write', 'warn'))
task('lint/eslint/fix', () => step(eslintCommand + ' --fix'))
task('lint/strict-once', async () => {
    const p1 = step(eslintCommand).catch(e => e)
    const p2 = step('prettier --check "./src/**/*.{ts,tsx}"').catch(e => e)
    const eslint = await p1
    const prettier = await p2
    if (!eslint && !eslint) return
    if (eslint && prettier) throw new Error('Both ESLint and Prettier failed!\n' + eslint + '\n' + prettier)
    if (eslint) throw new Error('ESLint check failed!\n' + eslint)
    if (prettier) throw new Error('Prettier check failed!\n' + prettier)
})

task('install', () => series('install/holoflows'))
task('install/holoflows', async () => {
    const base = path.join(process.cwd(), 'node_modules/@holoflows')
    if (process.argv.includes('--upgrade')) {
        await step('yarn upgrade @holoflows/kit')
    }
    await step(`cd ${path.join(base, 'kit')} && yarn && yarn build`)
})

/**
 * @param cmd {string} The command you want to run
 * @param [opt] {object} Options
 * @param [opt.withWarn] {boolean} Show warn in stdio
 * @param [opt.env] {NodeJS.ProcessEnv} Environment key-value pairs
 */
const step = (cmd, opt = { withWarn: true }) => {
    const child = spawn(cmd, [], {
        shell: true,
        stdio: ['inherit', 'inherit', opt.withWarn ? 'inherit' : 'ignore'],
        env: opt.env,
    })

    return new Promise((resolve, reject) => {
        child.on('error', reject)

        child.on('exit', code => {
            if (code === 0) {
                resolve()
            } else {
                const err = new Error(`child exited with code ${code}`)
                reject(err)
            }
        })
    })
}

const untilDirChanged = (dir = '.', timeout = 4000) => {
    return new Promise((resolve => {
        let last = undefined
        watch(dir).on('all', () => {
            if (last) {
                clearTimeout(last)
            }
            last = setTimeout(resolve, timeout)
        })
    }))
}
