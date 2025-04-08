import { fromNPMTask, PKG_PATH } from '../utils/index.ts'

export const [buildSentry] = fromNPMTask(new URL('./sentry/', PKG_PATH), 'build-sentry', 'Build sentry.')
