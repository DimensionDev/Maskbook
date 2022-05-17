import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import type { RouterV2 } from '@masknet/web3-contracts/types/RouterV2'
import { ChainId, useContract } from '@masknet/web3-shared-evm'

export function useRouterV2Contract(address?: string, chainId?: ChainId) {
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[], chainId)
}
