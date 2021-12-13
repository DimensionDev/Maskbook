import { series, src, dest } from 'gulp'
import { createBuildStorybook6, NETLIFY_PATH, PKG_PATH, shell, task } from '../utils'
import { resolve } from 'path'
import { codegen } from '../codegen'

const SITES_PATH = resolve(NETLIFY_PATH, 'sites')
const STATIC_PATH = resolve(NETLIFY_PATH, 'storybook-static')

// prettier-ignore
const dashboardSB = createBuildStorybook6(
    resolve(PKG_PATH, 'dashboard'),
    resolve(STATIC_PATH, 'dashboard'),
    'dashboard-storybook',
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
        return shell.cwd(icons)`pnpm run build`
    },
    function copyIcons() {
        const from = src(resolve(PKG_PATH, 'icons', 'build.html'))
        const to = dest(resolve(SITES_PATH, 'icons'))
        return from.pipe(to)
    },
)
export const buildNetlify = series(codegen, icons, themeSB)
task(buildNetlify, 'build-ci-netlify', 'Build for Netlify')
