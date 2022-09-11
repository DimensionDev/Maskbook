import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor'))),
    },
})
