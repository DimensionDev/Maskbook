import { buildWebpackTask, getWebpackConfig } from './helper'
import { output } from './paths'

const { watch, build } = buildWebpackTask(
    'dependencies',
    (mode) => {
        const obj = getWebpackConfig(mode, output.dependencies.file, output.extension.folder)
        obj.output!.filename = 'umd_es.js'
        return obj
    },
    'Build all node style dependencies by Webpack',
)
export const dependenciesBuild = build
export const dependenciesWatch = watch
