// Do not export JSX from this file. It might break some runtime that does not have DOM.
import { registerPlugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'

export { base } from './base.js'
export * from './messages.js'
export * from './constants.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./Dashboard/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./Dashboard', () => hot(import('./Dashboard/index.js'))),
    },
})
