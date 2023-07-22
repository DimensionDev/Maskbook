import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    RequestArguments,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { FlowWeb3State, SharedPluginContext } from '@masknet/web3-providers'
import { base } from '../../base.js'

const dashboard: Plugin.Dashboard.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await FlowWeb3State.create(context)

        FlowWeb3State.setup(state)
        dashboard.Web3State = FlowWeb3State.state
    },
}

export default dashboard
