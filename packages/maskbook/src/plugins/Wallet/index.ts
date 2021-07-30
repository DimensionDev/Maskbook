import { registerPlugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) => {
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor')))
            // If you're changing @masknet/plugin-wallet/components package
            // you can uncomment the following line to fix HMR
            // import.meta.webpackHot?.accept()
        },
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
