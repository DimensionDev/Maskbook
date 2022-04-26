import type { Plugin } from '@masknet/plugin-infra'
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
} from '@masknet/web3-shared-solana'
import { base } from '../../base'
import { SharedContextSettings, Web3StateSettings } from '../../settings'
import { createWeb3State } from '../../state'
import { Web3UI } from '../Web3UI'

const dashboard: Plugin.Dashboard.Definition<
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
> = {
    ...base,
    init(signal, context) {
        const Web3State = createWeb3State(context)

        dashboard.Web3State = Web3State
        Web3StateSettings.value = Web3State
        SharedContextSettings.value = context
    },
    Web3UI,
}

export default dashboard
