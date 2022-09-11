import { registerPlugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    GasOption,
    Block,
    Operation,
    Transaction,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
    TransactionReceipt,
} from '@masknet/web3-shared-flow'
import { base } from './base.js'

registerPlugin<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    GasOption,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    TransactionParameter,
    Web3
>({
    ...base,
    SNSAdaptor: {
        load: () => import('./UI/SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/SNSAdaptor', () => hot(import('./UI/SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./UI/Dashboard', () => hot(import('./UI/Dashboard/index.js'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
