const { series, parallel } = require('gulp')
const { spawn } = require('child_process')

const { join, relative } = require('path')
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

exports.buildNetlify = series(build, parallel(taskA, taskB))
