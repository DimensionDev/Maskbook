import { registerPlugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import { base } from './base.js'

registerPlugin<ChainId, SchemaType, ProviderType, NetworkType, Transaction, TransactionParameter>({
    ...base,
    SNSAdaptor: {
        load: () => import('./UI/SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/SNSAdaptor', () => hot(import('./UI/SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/Dashboard', () => hot(import('./UI/Dashboard/index.js'))),
    },
})
