import { fromNPMTask } from '../utils'
import { resolve } from 'path'
export const [buildSentry] = fromNPMTask(resolve(__dirname, '../../../sentry'), 'sentry', 'Build sentry.')
