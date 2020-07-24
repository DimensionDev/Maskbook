// https://wpt.fyi/results/workers/modules/dedicated-worker-import.any.html?label=master&product=chrome%5Bstable%5D&product=firefox%5Bstable%5D&product=safari%5Bstable%5D&product=chrome%5Bexperimental%5D&product=firefox%5Bexperimental%5D&product=safari%5Bexperimental%5D&aligned
// https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker

/**
 * Only Chrome supports ESModule for Worker.
 * So we bundle it.
 */
import { buildWebpackTask, getWebpackConfig } from './helper'
import { output, WorkerEntries } from './paths'
export const [workerBuild, workerWatch] = buildWebpackTask('workers', 'Build Web Workers by Webpack', (mode) => {
    const conf = getWebpackConfig(mode, WorkerEntries, output.workers.folder)
    conf.target = 'webworker'
    return conf
})
