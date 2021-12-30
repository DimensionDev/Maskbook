import { fromNPMTask } from '../utils'
import { resolve } from 'path'
export const [buildPolyfill] = fromNPMTask(
    resolve(__dirname, '../../../polyfills'),
    'polyfill',
    'Build polyfill required for Mask Network.',
)
