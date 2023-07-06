import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import { SharedPluginContext, Web3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const sns: Plugin.SNSAdaptor.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        console.log('DEBUG: EVM')
        console.log({
            context,
        })

        SharedPluginContext.setup(context)

        const state = await Web3State.create(context)

        Web3State.setup(state)
        sns.Web3State = Web3State.state
    },
}

export default sns
