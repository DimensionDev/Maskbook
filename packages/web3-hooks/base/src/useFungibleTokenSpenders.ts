import { useAsyncRetry } from 'react-use'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { HubOptions } from '@masknet/web3-shared-base'

export function useFungibleTokenSpenders(options?: HubOptions<ChainId>) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>(options)
    const hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useAsyncRetry(async () => hub?.getFungibleTokenSpenders?.(chainId, account), [chainId, account, hub])
}
