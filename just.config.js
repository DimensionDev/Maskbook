const { task, parallel } = require('just-task')
const { spawn } = require('child_process')
const path = require('path')

task('install/holoflows', async () => {
    const base = path.join(process.cwd(), 'node_modules/@holoflows')
    await step(`cd ${path.join(base, 'kit')} && yarn && yarn build`)
})

const lintCommand = async (str, level = 'log') => {
    const listen = 'onchange "./src/**/*" -i --'
    await step(`${listen} prettier --${str} "./src/**/*.{ts,tsx}" --loglevel ${level}`)
}

task('lint', () => lintCommand('check'))
task('lint/fix', () => lintCommand('write', 'warn'))

task('storybook/serve', () => step('start-storybook -p 9009 -s public --quiet', true))

task('storybook', parallel('lint/fix', 'storybook/serve'))
task('storybook/build', () => step('build-storybook -s public --quiet', true))

task('react/start', () => step('react-app-rewired start'))
task('react/build', () => step('react-app-rewired build'))
task('react/test', () => step('react-app-rewired test'))

task('react', parallel('lint/fix', 'react/start'))

const step = (cmd, withWarn = false) => {
    const child = spawn(cmd, [], {
        shell: true,
        stdio: ['inherit', 'inherit', withWarn ? 'inherit' : 'ignore'],
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
