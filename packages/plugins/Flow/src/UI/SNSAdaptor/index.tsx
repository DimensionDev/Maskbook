import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowWeb3State, SharedPluginContext } from '@masknet/web3-providers'
import { base } from '../../base.js'

const sns: Plugin.SiteAdaptor.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await FlowWeb3State.create(context)

        FlowWeb3State.setup(state)
        sns.Web3State = FlowWeb3State.state
    },
}

export default sns
