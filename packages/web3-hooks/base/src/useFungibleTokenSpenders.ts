import { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleTokenSpenders(options?: HubOptions<ChainId>) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>(options)
    const hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useQuery({
        queryKey: ['fungible-tokens', 'spenders', chainId, account],
        enabled: !!hub?.getFungibleTokenSpenders,
        queryFn: async () => {
            return hub?.getFungibleTokenSpenders?.(chainId, account)
        },
    })
}
