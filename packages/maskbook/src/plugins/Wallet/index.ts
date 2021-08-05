import { registerPlugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./Dashboard'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Dashboard', () => hot(import('./Dashboard'))),
    },
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker'))),
    },
})
