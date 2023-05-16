import type { Plugin } from '@masknet/plugin-infra'
import type {
    AddressType,
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    GasOption,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
} from '@masknet/web3-shared-solana'
import { SharedUIPluginContext, SolanaWeb3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const dashboard: Plugin.Dashboard.Definition<
    ChainId,
    AddressType,
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
> = {
    ...base,
    async init(signal, context) {
        SharedUIPluginContext.setup(context)

        const state = await SolanaWeb3State.create(context)

        SolanaWeb3State.setup(state)
        dashboard.Web3State = SolanaWeb3State.state
    },
}

export default dashboard
