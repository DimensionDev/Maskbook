import type { Plugin } from '@masknet/plugin-infra'
import type {
    AddressType,
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    GasOption,
    UserTransaction,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
    Block,
} from '@masknet/web3-shared-evm'
import { base } from '../../base.js'
import { createWeb3State } from '../../state/index.js'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'

const sns: Plugin.SNSAdaptor.Definition<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    GasOption,
    Block,
    UserTransaction,
    Transaction,
    TransactionReceipt,
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
