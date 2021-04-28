import { registerPlugin } from '@dimensiondev/mask-plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) => {
            if (module.hot) {
                module.hot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor')))
            }
        },
    },
})
