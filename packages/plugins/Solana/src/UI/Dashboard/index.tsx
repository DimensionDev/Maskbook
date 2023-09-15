import type { Plugin } from '@masknet/plugin-infra'
import { SharedPluginContext, SolanaWeb3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await SolanaWeb3State.create(context)
        SolanaWeb3State.setup(state)
        context.setWeb3State(SolanaWeb3State.state)
    },
}

export default dashboard
