import { series, TaskFunction } from 'gulp'
import { createBuildStorybook7, fromNPMTask, PKG_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'

const STATIC_PATH = new URL('netlify/storybook-static/', PKG_PATH)

// prettier-ignore
const dashboardSB = createBuildStorybook7(
    new URL('dashboard/', PKG_PATH),
    new URL('dashboard/', STATIC_PATH),
    'dashboard-storybook',
)
// prettier-ignore
const themeSB = createBuildStorybook7(
    new URL('theme/', PKG_PATH),
    new URL('theme/', STATIC_PATH),
    'theme',
)

export const buildNetlify: TaskFunction = series(codegen, dashboardSB, themeSB)
task(buildNetlify, 'build-ci-netlify', 'Build for Netlify')
