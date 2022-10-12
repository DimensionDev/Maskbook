import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useWeb3State } from './useWeb3State.js'

export function useLookupAddress<T extends NetworkPluginID>(pluginId?: T, domain?: string) {
    const { NameService, Others } = useWeb3State(pluginId)

    return useAsyncRetry(async () => {
        if (
            !domain ||
            !Others?.isValidDomain?.(domain) ||
            !NameService ||
            (pluginId && pluginId !== NetworkPluginID.PLUGIN_EVM)
        )
            return
        return NameService.lookup?.(ChainId.Mainnet, domain)
    }, [domain, NameService, Others, pluginId])
}
