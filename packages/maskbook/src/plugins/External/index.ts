import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            module.hot && module.hot.accept('./SNSAdaptor/index', () => hot(import('./SNSAdaptor'))),
    },
})
