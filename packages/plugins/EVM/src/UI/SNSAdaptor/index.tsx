import type { Plugin } from '@masknet/plugin-infra'
import type {
    AddressType,
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Signature,
    GasOption,
    UserOperation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionParameter,
    TransactionSignature,
    Web3,
    Block,
} from '@masknet/web3-shared-evm'
import { SharedUIPluginContext, Web3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const sns: Plugin.SNSAdaptor.Definition<
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
        sns.Web3State = Web3State.state
    },
}

export default sns
