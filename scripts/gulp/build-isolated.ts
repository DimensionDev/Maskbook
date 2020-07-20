import { buildWebpackTask, getWebpackConfig } from './helper'
import { output, IsolatedEntries } from './paths'
export const { build: isolatedBuild, watch: isolatedWatch } = buildWebpackTask(
    'isolated',
    'Build isolated entries (injected scripts) by Webpack',
    (mode) => {
        const conf = getWebpackConfig(mode, IsolatedEntries, output.isolated.folder)
        conf.optimization!.splitChunks = false
        return conf
    },
)
