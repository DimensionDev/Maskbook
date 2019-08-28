const { task, series, parallel } = require('just-task')
const { spawn } = require('child_process')
const path = require('path')

const prettierCommand = async (str, level = 'log') => {
    await step(['prettier', `--${str}`, './src/**/*.{ts,tsx}', '--loglevel', level])
}
const eslintCommand = ['eslint', '--ext', 'tsx,ts', './src/', '--cache']

task('watch', () => parallel('react', 'watch/hot-reload-firefox'))
task('watch/hot-reload-firefox', () => step(['web-ext', 'run', '--source-dir', './dist/']))

task('react', () => parallel('react/start', 'lint/fix'))
task('react/start', () => step(['react-app-rewired', 'start']))
task('react/build', () => step(['react-app-rewired', 'build']))
task('react/test', () => step(['react-app-rewired', 'test']))

task('prettier', () => prettierCommand('check'))
task('prettier/fix', () => prettierCommand('write', 'warn'))
task('eslint', () => step(eslintCommand, { withWarn: true }))
task('eslint/fix', () => step(eslintCommand.concat(['--fix'])))
task('lint', () => parallel('prettier', 'eslint'))
task('lint/fix', () => series('prettier/fix', 'eslint/fix'))

task('storybook', () => parallel('lint/fix', 'storybook/serve'))
task('storybook/serve', () => step(['start-storybook', '-p', '9009', '-s', 'public', '--quiet'], { withWarn: true }))
task('storybook/build', () => step(['build-storybook', '-s', 'public', '--quiet'], { withWarn: true }))

task('install', () => series('install/holoflows'))
task('install/holoflows', async () => {
    if (process.argv.includes('--upgrade')) {
        await step(['yarn', 'upgrade', '@holoflows/kit'])
    }
    const dir = { cwd: path.join(process.cwd(), 'node_modules/@holoflows/kit') }
    await step(['yarn'], dir)
    await step(['yarn', 'build'], dir)
})

/**
 * @param cmd {string[] | string} The command you want to run
 * @param [opt] {import('child_process').SpawnOptions & { withwarn: boolean }} Options
 * @param [opt.withWarn] {boolean} Show warn in stdio
 */
const step = (cmd, opt = { withWarn: process.env.CI === 'true' }) => {
    if (!Array.isArray(cmd)) cmd = [cmd]
    const child = spawn(cmd[0], cmd.splice(1), {
        stdio: ['inherit', 'inherit', opt.withWarn ? 'inherit' : 'ignore'],
        ...opt,
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
