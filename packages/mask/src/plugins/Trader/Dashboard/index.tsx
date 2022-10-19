import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginWeb3ContextProvider } from '@masknet/web3-hooks-base'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <PluginWeb3ContextProvider value={{ chainId: ChainId.Mainnet, pluginID: NetworkPluginID.PLUGIN_EVM }}>
                    <TraderDialog />
                </PluginWeb3ContextProvider>
            </>
        )
    },
}

export default dashboard
