import { registerPlugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
} from '@masknet/web3-shared-flow'
import { base } from './base'

registerPlugin<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    TransactionParameter,
    Web3
>({
    ...base,
    SNSAdaptor: {
        load: () => import('./UI/SNSAdaptor'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/SNSAdaptor', () => hot(import('./UI/SNSAdaptor'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/Dashboard', () => hot(import('./UI/Dashboard'))),
    },
    Worker: {
        load: () => import('./Worker'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker'))),
    },
})
