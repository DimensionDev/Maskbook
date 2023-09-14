import type { Plugin } from '@masknet/plugin-infra'
import { SharedPluginContext, Web3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await Web3State.create(context)
        Web3State.setup(state)
        context.setWeb3State(Web3State.state)
    },
}

export default site
