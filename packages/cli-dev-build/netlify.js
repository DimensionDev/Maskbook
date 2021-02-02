const { series, parallel } = require('gulp')
const { spawn } = require('child_process')

const { join, relative } = require('path')
const { existsSync } = require('fs')
const root = join(__dirname, '../../')
const dashboard = join(__dirname, '../dashboard')
const theme = join(__dirname, '../theme')
const netlify = join(__dirname, '../netlify')

const createBuildStorybook6 = (basePath, output, name) => {
    const f = () => {
        const r = relative(basePath, output)
        return spawn(`npx`, ['build-storybook', '-o', r, '-s', r, '--quiet'], {
            cwd: basePath,
            shell: true,
            stdio: 'inherit',
        })
    }
    f.displayName = name + '-storybook'
    f.description = `Build storybook of ${name} to ${output}`
    return f
}

const { build } = require('./ts')
const addrA = join(netlify, 'storybook-static/dashboard')
const addrB = join(netlify, 'storybook-static/theme')
const taskA = createBuildStorybook6(dashboard, addrA, 'dashboard')
const taskB = createBuildStorybook6(theme, addrB, 'theme')

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000))
const check = () => {
    const l = join(addrA, './iframe.html')
    const j = join(addrB, './iframe.html')
    // npx build-storybook will quite before the build process is done
    const a = existsSync(l)
    const b = existsSync(j)
    if (a && b) return Promise.resolve()
    console.log(l, a, j, b)
    return sleep().then(check)
}
exports.buildNetlify = series(build, parallel(taskA, taskB), check)
