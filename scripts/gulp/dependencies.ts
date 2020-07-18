import { buildWebpackTask, getWebpackConfig } from './helper'
import { output } from './paths'

export const { watch: dependenciesWatch, build: dependenciesBuild } = buildWebpackTask(
    'dependencies',
    'Build all node style dependencies by Webpack',
    (mode) => {
        const obj = getWebpackConfig(mode, output.dependencies.file, output.extension.folder)
        obj.output!.filename = 'umd_es.js'
        return obj
    },
)
