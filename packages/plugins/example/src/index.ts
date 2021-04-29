import { registerPlugin } from '@dimensiondev/mask-plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            module.hot && module.hot.accept('./SNSAdaptor/index', () => hot(import('./SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./Dashboard'),
        hotModuleReload: (hot) =>
            module.hot && module.hot.accept('./Dashboard/index', () => hot(import('./Dashboard'))),
    },
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) => module.hot && module.hot.accept('./Worker/index', () => hot(import('./Worker'))),
    },
})
