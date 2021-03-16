const { series, parallel } = require('gulp')
const { spawn } = require('child_process')

const { join, relative } = require('path')
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

const createBuildSnowpack = (basePath, output, name) => {
    const f = () => {
        const r = relative(basePath, output)
        return spawn(`npx`, ['snowpack', 'build', '--buildOptions.out', r, '--quiet'], {
            cwd: basePath,
            shell: true,
            stdio: 'inherit',
        })
    }
    f.displayName = name + '-snowpack'
    f.description = `Build snowpack of ${name} to ${output}`
    return f
}

const { build } = require('./ts')
const iconsSnowpack = createBuildSnowpack(join(__dirname, '../icons'), join(netlify, 'snowpack/icons'), 'icons')
const dashboard = createBuildSnowpack(join(__dirname, '../dashboard'), join(netlify, 'snowpack/dashboard'), 'dashboard')
const dashboardSB = createBuildStorybook6(
    join(__dirname, '../dashboard'),
    join(netlify, 'storybook-static/dashboard'),
    'dashboard-snowpack',
)
const themeSB = createBuildStorybook6(join(__dirname, '../theme'), join(netlify, 'storybook-static/theme'), 'theme')

exports.buildNetlify = parallel(iconsSnowpack, series(build, parallel(dashboardSB, themeSB, dashboard)))
