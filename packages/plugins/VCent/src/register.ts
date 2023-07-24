import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./Worker/index.js'))),
    },
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
})
