import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

export * from './SNSAdaptor/components/BridgeStack.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
})
