import { registerPlugin } from '@dimensiondev/mask-plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) => module.hot && module.hot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./Dashboard'),
        hotModuleReload: (hot) => module.hot && module.hot.accept('./Dashboard', () => hot(import('./Dashboard'))),
    },
})
