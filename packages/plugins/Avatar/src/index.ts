import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
export * from './SNSAdaptor/index.js'
export * from './types.js'
export * from './constants.js'
export * from './utils/index.js'
export * from './hooks/index.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
