import { series } from 'gulp'
import { createBuildStorybook6, NETLIFY_PATH, PKG_PATH, shell, task } from '../utils'
import { resolve } from 'path'
import { codegen } from '../codegen'

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

export const buildNetlify = series(codegen, dashboardSB, themeSB)
task(buildNetlify, 'build-ci-netlify', 'Build for Netlify')
