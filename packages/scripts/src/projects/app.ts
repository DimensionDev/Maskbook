import { fromNPMTask, PKG_PATH, task } from '../utils/index.js'

export const [buildSPA, startSPA] = fromNPMTask(new URL('app/', PKG_PATH), 'spa', 'Build SPA of Mask Network.')

task(buildSPA, 'build-spa', 'Build SPA')
