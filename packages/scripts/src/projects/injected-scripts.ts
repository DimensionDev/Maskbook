import { fromNPMTask } from '../utils'
import { resolve } from 'path'
export const [buildInjectedScript, watchInjectedScript] = fromNPMTask(
    resolve(__dirname, '../../../injected-script'),
    'injected-script',
    'An extra script that runs in the main frame to provide some extra functionality of Mask Network.',
)
