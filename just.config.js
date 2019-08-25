const { task, series, parallel } = require('just-task')
const { spawn } = require('child_process')
const path = require('path')

const lintCommand = async (str, level = 'log') => {
    const listen = 'onchange "./src/**/*" -i --'
    await step(`${listen} prettier --${str} "./src/**/*.{ts,tsx}" --loglevel ${level}`)
}

task('watch', () => parallel('react', 'watch/hot-reload-firefox'))
task('watch/hot-reload-firefox', () => step('web-ext run --source-dir ./dist/'))

task('react', () => parallel('lint/fix', 'react/start'))
task('react/start', () => step('react-app-rewired start'))
task('react/build', () => step('react-app-rewired build'))
task('react/test', () => step('react-app-rewired test'))

task('lint', () => lintCommand('check'))
task('lint/fix', () => lintCommand('write', 'warn'))

task('storybook', () => parallel('lint/fix', 'storybook/serve'))
task('storybook/serve', () => step('start-storybook -p 9009 -s public --quiet', { withWarn: true }))
task('storybook/build', () => step('build-storybook -s public --quiet', { withWarn: true }))

task('install', () => series('install/holoflows'))
task('install/holoflows', async () => {
    const base = path.join(process.cwd(), 'node_modules/@holoflows')
    await step('yarn upgrade @holoflows/kit')
    await step(`cd ${path.join(base, 'kit')} && yarn && yarn build`)
})

/**
 * @param cmd {string} The command you want to run
 * @param opt {object} Options
 * @param opt.withWarn {boolean} Show warn in stdio
 * @param opt.env {NodeJS.ProcessEnv} Environment key-value pairs
 */
const step = (cmd, opt = { withWarn: false }) => {
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
