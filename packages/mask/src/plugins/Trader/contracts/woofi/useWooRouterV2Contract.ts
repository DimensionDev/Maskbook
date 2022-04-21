import type { AbiItem } from 'web3-utils'
import WooRouterV2ABI from '@masknet/web3-contracts/abis/WooRouterV2.json'
import type { WooRouterV2 } from '@masknet/web3-contracts/types/WooRouterV2'
import { ChainId, useContract } from '@masknet/web3-shared-evm'

export function useWooRouterV2Contract(address?: string, chainId?: ChainId) {
    return useContract<WooRouterV2>(address, WooRouterV2ABI as AbiItem[], chainId)
}
