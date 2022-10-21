import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainContextProvider, NetworkContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
                <ChainContextProvider value={{ chainId: ChainId.Mainnet }}>
                    <TraderDialog />
                </ChainContextProvider>
            </NetworkContextProvider>
        )
    },
}

export default dashboard
