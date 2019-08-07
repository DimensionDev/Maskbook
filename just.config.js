const maxBuffer = 1048576 * 64 // MB

const { task, parallel } = require('just-task')
const { exec } = require('just-scripts-utils')

task('install/holoflows', () => {
    step('cd node_modules/@holoflows/kit && yarn && yarn build').then()
})

const lintCommand = async (str, level = 'log') => {
    const listen = 'onchange "./src/**/*" -i --'
    await step(
        `${listen} prettier --${str} "./src/**/*.{ts,tsx}" --loglevel ${level}`)
}

task('lint', () => lintCommand('check'))
task('lint/fix', () => lintCommand('write', 'warn'))

task('storybook/serve', () => step('start-storybook -p 9009 -s public'))

task('storybook', parallel('lint/fix', 'storybook/serve'))
task('storybook/build', () => step('build-storybook -s public'))

task('react/start', () => step('react-app-rewired start'))
task('react/build', () => step('react-app-rewired build'))
task('react/test', () => step('react-app-rewired test'))

task('react', parallel('lint/fix', 'react/start'))

const step = async (cmd, withWarn = false) => {
    await exec(cmd, {
        maxBuffer,
        stdout: process.stdout,
        stderr: withWarn ? process.stderr : undefined,
    })
}
