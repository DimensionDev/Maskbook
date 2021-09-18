import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor'))),
    },
    Dashboard: undefined,
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker'))),
    },
})
