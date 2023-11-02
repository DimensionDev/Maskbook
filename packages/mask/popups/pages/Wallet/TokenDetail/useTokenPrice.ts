import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenPrice, useNativeTokenAddress } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useTokenPrice(chainId: ChainId, address?: string) {
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, address ?? nativeTokenAddress, { chainId })
}
