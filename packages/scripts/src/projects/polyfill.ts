import { fromNPMTask, PKG_PATH } from '../utils/index.js'
export const [buildPolyfill] = fromNPMTask(
    new URL('polyfills/', PKG_PATH),
    'polyfill',
    'Build polyfill required for Mask Network.',
)
