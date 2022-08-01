import { fromNPMTask, PKG_PATH } from '../utils/index.js'
export const [buildInjectedScript, watchInjectedScript] = fromNPMTask(
    new URL('injected-script/', PKG_PATH),
    'injected-script',
    'An extra script that runs in the main frame to provide some extra functionality of Mask Network.',
)
