import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor/index', () => hot(import('./SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./Dashboard'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./Dashboard/index', () => hot(import('./Dashboard'))),
    },
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./Worker/index', () => hot(import('./Worker'))),
    },
})
