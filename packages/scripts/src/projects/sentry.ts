import { fromNPMTask, PKG_PATH } from '../utils/index.js'

export const [buildSentry] = fromNPMTask(new URL('sentry/', PKG_PATH), 'build-sentry', 'Build sentry.')
