import type { Plugin } from '@masknet/plugin-infra'
import type {
    AddressType,
    Block,
    ChainId,
    GasOption,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    UserOperation,
    Transaction,
    TransactionSignature,
    TransactionDetailed,
    TransactionParameter,
    TransactionReceipt,
    Web3,
} from '@masknet/web3-shared-evm'
import { SharedUIPluginContext, Web3State } from '@masknet/web3-providers'
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
    UserOperation,
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

        const state = await Web3State.create(context)

        Web3State.setup(state)
        dashboard.Web3State = state
    },
}

export default dashboard
