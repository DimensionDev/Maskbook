import { registerPlugin } from '@masknet/plugin-infra'
import {
    type ChainId,
    type NetworkType,
    type ProviderType,
    type SchemaType,
    type RequestArguments,
    type RequestOptions,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { base } from './base.js'

registerPlugin<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
>({
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
