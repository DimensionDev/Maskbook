import type { Plugin } from '@masknet/plugin-infra'
import { FlowWeb3State, SharedPluginContext } from '@masknet/web3-providers'
import { base } from '../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await FlowWeb3State.create(context)
        FlowWeb3State.setup(state)
        context.setWeb3State(FlowWeb3State.state)
    },
}

export default site
