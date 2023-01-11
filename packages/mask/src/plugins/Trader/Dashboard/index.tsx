import type { Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useNetworkContext, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition<ChainId> = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        const { pluginID } = useNetworkContext()
        return (
            <Web3ContextProvider value={{ pluginID }}>
                <TraderDialog />
            </Web3ContextProvider>
        )
    },
}

export default dashboard
