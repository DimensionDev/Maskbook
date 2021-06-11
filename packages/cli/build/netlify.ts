import { spawn } from 'child_process'
import { parallel, series, src, dest } from 'gulp'
import { relative, resolve } from 'path'
import { build } from './typescript'
import { NETLIFY_PATH, PKG_PATH } from '../utils'
import { renameSync } from 'fs'

const createBuildStorybook6 = (basePath: string, output: string, name: string) => {
    const fn = () => {
        const r = relative(basePath, output)
        const command = ['build-storybook', '-o', r]
        console.log(basePath, '$', ...command)
        return spawn('npx', command, {
            cwd: basePath,
            shell: true,
            stdio: 'inherit',
        })
    }
    fn.displayName = `${name}-storybook`
    fn.description = `Build storybook of ${name} to ${output}`
    return fn
}

const createBuildSnowpack = (basePath: string, output: string, name: string) => {
    const fn = () => {
        const r = relative(basePath, output)
        const command = ['snowpack', 'build', '--buildOptions.out', r]
        console.log(basePath, '$', ...command)
        return spawn('npx', command, {
            cwd: basePath,
            shell: true,
            stdio: 'inherit',
        })
    }
    fn.displayName = `${name}-snowpack`
    fn.description = `Build snowpack of ${name} to ${output}`
    return fn
}

const SNOWPACK_PATH = resolve(NETLIFY_PATH, 'snowpack')
const STATIC_PATH = resolve(NETLIFY_PATH, 'storybook-static')

// prettier-ignore
const dashboard = createBuildSnowpack(
    resolve(PKG_PATH, 'dashboard'),
    resolve(SNOWPACK_PATH, 'dashboard'),
    'dashboard',
)
// prettier-ignore
const dashboardSB = createBuildStorybook6(
    resolve(PKG_PATH, 'dashboard'),
    resolve(STATIC_PATH, 'dashboard'),
    'dashboard-snowpack',
)
// prettier-ignore
const themeSB = createBuildStorybook6(
    resolve(PKG_PATH, 'theme'),
    resolve(STATIC_PATH, 'theme'),
    'theme',
)

const icons = series(
    function buildIcons() {
        return spawn('npm', ['run', 'build'], {
            cwd: resolve(PKG_PATH, 'icons'),
            shell: true,
            stdio: 'inherit',
        })
    },
    function copyIcons() {
        const from = src(resolve(PKG_PATH, 'icons', 'build.html'))
        const to = dest(resolve(SNOWPACK_PATH, 'icons'))
        return from.pipe(to)
    },
)
export const buildNetlify = series(build, parallel(icons, dashboardSB, themeSB /* , dashboard */))
