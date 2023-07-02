import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
import type { ChainId } from '@masknet/web3-shared-evm'

registerPlugin<ChainId>({
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
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
