import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowWeb3State, SharedUIPluginContext } from '@masknet/web3-providers'
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
        SharedUIPluginContext.setup(context)

        const state = await FlowWeb3State.create(context)

        FlowWeb3State.setup(state)
        sns.Web3State = FlowWeb3State.state
    },
}

export default sns
