import { spawn } from 'child_process'
import { parallel, series } from 'gulp'
import { relative, resolve } from 'path'
import { build } from './typescript'
import { NETLIFY_PATH, PKG_PATH } from '../utils'

const createBuildStorybook6 = (basePath: string, output: string, name: string) => {
    const fn = () => {
        const r = relative(basePath, output)
        return spawn('npx', ['build-storybook', '-o', r, '-s', r, '--quiet'], {
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
        return spawn('npx', ['snowpack', 'build', '--buildOptions.out', r, '--quiet'], {
            cwd: basePath,
            shell: true,
            stdio: 'inherit',
        })
    }
    fn.displayName = `${name}-snowpack`
    fn.description = `Build snowpack of ${name} to ${output}`
    return fn
}

const SNOWPACK_PATH = relative(NETLIFY_PATH, 'snowpack')
const STATIC_PATH = resolve(NETLIFY_PATH, 'storybook-static')

// prettier-ignore
const iconsSnowpack = createBuildSnowpack(
    resolve(PKG_PATH, 'icons'),
    resolve(SNOWPACK_PATH, 'icons'),
    'icons',
)
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

export const buildNetlify = parallel(iconsSnowpack, series(build, parallel(dashboardSB, themeSB, dashboard)))
