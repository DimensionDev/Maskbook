import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,

    SNSAdaptor: {
        load: () => import('./UI/SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/SNSAdaptor', () => hot(import('./UI/SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/Dashboard', () => hot(import('./UI/Dashboard'))),
    },
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker'))),
    },
})
