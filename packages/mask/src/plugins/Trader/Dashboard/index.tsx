import type { Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM }}>
                <TraderDialog />
            </Web3ContextProvider>
        )
    },
}

export default dashboard
