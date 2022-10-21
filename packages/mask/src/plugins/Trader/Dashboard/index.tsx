import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <ChainContextProvider value={{ chainId: ChainId.Mainnet, pluginID: NetworkPluginID.PLUGIN_EVM }}>
                <TraderDialog />
            </ChainContextProvider>
        )
    },
}

export default dashboard
