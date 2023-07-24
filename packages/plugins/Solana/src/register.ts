import { registerPlugin } from '@masknet/plugin-infra'
import {
    type RequestArguments,
    type ChainId,
    type NetworkType,
    type ProviderType,
    type SchemaType,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-solana'
import { base } from './base.js'

registerPlugin<ChainId, SchemaType, ProviderType, NetworkType, RequestArguments, Transaction, TransactionParameter>({
    ...base,
    SNSAdaptor: {
        load: () => import('./UI/SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./UI/SNSAdaptor', () => hot(import('./UI/SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./UI/Dashboard', () => hot(import('./UI/Dashboard/index.js'))),
    },
})
