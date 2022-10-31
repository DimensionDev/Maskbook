import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
export * from './UI'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./Dashboard', () => hot(import('./Dashboard/index.js'))),
    },
})
