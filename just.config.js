const maxBuffer = 1048576 * 64 // MB
const cp = require('child_process')

const { task, logger, parallel } = require('just-task')

task('install/holoflows', () => {
    exec('cd node_modules/@holoflows/kit && yarn && yarn build').then()
})

const lintCommand = async (str, level = 'log') => {
    const listen = 'onchange "./src/**/*" -i --'
    await exec(
        `${listen} prettier --${str} "./src/**/*.{ts,tsx}" --loglevel ${level}`)
}

task('lint', () => lintCommand('check'))
task('lint/fix', () => lintCommand('write', 'warn'))

task('storybook/serve', () => exec('start-storybook -p 9009 -s public'))

task('storybook', parallel('lint/fix', 'storybook/serve'))
task('storybook/build', () => exec('build-storybook -s public'))

task('react/start', () => exec('react-app-rewired start'))
task('react/build', () => exec('react-app-rewired build'))
task('react/test', () => exec('react-app-rewired test'))

task('react', parallel('lint/fix', 'react/start'))

function exec(cmd, echo = true, echoWarn = false) {
    return new Promise((resolve, reject) => {
        const child = cp.exec(cmd, {maxBuffer}, (error, stdout, stderr) => {
            if (error) {
                error.stdout = stdout
                error.stderr = stderr
                reject(error)
            } else {
                resolve(stdout)
            }
        })
        if (echo) {
            child.stdout.on('data', (data) => logger.info(data))
            if (echoWarn) {
                child.stderr.on('data', (data) => logger.warn(data))
            }
            // destroyed on child exit, no memory leaks here.
        }
    })
}
