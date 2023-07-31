import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-bitcoin'
import { SharedPluginContext, BitcoinWeb3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const dashboard: Plugin.Dashboard.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await BitcoinWeb3State.create(context)

        BitcoinWeb3State.setup(state)
        dashboard.BitcoinWeb3State = state
    },
}

export default dashboard
