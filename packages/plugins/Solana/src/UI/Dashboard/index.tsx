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
import { base } from '../../base.js'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'
import { createWeb3State } from '../../state/index.js'

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
        SharedContextSettings.value = context

        const Web3State = await createWeb3State(signal, context)

        dashboard.Web3State = Web3State
        Web3StateSettings.value = Web3State
    },
}

export default dashboard
