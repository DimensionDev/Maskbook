import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useWeb3State } from './useWeb3State.js'

export function useReverseAddress<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    const { NameService, Others } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (
            !address ||
            !Others?.isValidAddress?.(address) ||
            !NameService ||
            (pluginID && pluginID !== NetworkPluginID.PLUGIN_EVM)
        )
            return
        return NameService.reverse?.(ChainId.Mainnet, address)
    }, [address, NameService, pluginID])
}
