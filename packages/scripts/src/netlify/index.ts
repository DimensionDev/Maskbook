import { series, type TaskFunction } from 'gulp'
import { createBuildStorybook6, fromNPMTask, PKG_PATH, task } from '../utils/index.js'
import { codegen } from '../codegen/index.js'

const STATIC_PATH = new URL('netlify/storybook-static/', PKG_PATH)

// prettier-ignore
const themeSB = createBuildStorybook6(
    new URL('theme/', PKG_PATH),
    new URL('theme/', STATIC_PATH),
    'theme',
)

const [buildStorybookShared] = fromNPMTask(
    new URL('storybook-shared/', PKG_PATH),
    'build-storybook-shared',
    'Build shared files in Storybook',
)

// Note: run multiple webpack task in parallel might cause OOM
export const buildNetlify: TaskFunction = series(codegen, buildStorybookShared, themeSB)

task(buildNetlify, 'build-ci-netlify', 'Build for Netlify')
