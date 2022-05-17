import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    GasOption,
    Transaction,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
    Block,
} from '@masknet/web3-shared-evm'
import { base } from '../../base'
import { createWeb3State } from '../../state'
import { SharedContextSettings, Web3StateSettings } from '../../settings'

const sns: Plugin.SNSAdaptor.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    GasOption,
    Block,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    TransactionParameter,
    Web3
> = {
    ...base,
    async init(signal, context) {
        const Web3State = createWeb3State(context)

        sns.Web3State = Web3State
        Web3StateSettings.value = Web3State
        SharedContextSettings.value = context
    },
}

export default sns
