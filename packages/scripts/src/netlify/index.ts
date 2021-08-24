import { series, src, dest } from 'gulp'
import { createBuildStorybook6, NETLIFY_PATH, PKG_PATH, shell, task } from '../utils'
import { resolve } from 'path'
const SNOWPACK_PATH = resolve(NETLIFY_PATH, 'snowpack')
const STATIC_PATH = resolve(NETLIFY_PATH, 'storybook-static')

// prettier-ignore
// ? Breaking
// const dashboard = createBuildSnowpack(
//     resolve(PKG_PATH, 'dashboard'),
//     resolve(SNOWPACK_PATH, 'dashboard'),
//     'dashboard',
// )
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
        const icons = resolve(PKG_PATH, 'icons')
        return shell.cwd(icons)`npm run build`
    },
    function copyIcons() {
        const from = src(resolve(PKG_PATH, 'icons', 'build.html'))
        const to = dest(resolve(SNOWPACK_PATH, 'icons'))
        return from.pipe(to)
    },
)
export const buildNetlify = series(icons, dashboardSB, themeSB /* , dashboard */)
task(buildNetlify, 'build-ci-netlify', 'Build for Netlify')
