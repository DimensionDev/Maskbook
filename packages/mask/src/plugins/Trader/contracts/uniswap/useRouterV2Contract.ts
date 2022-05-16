import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '@masknet/web3-contracts/abis/RouterV2.json'
import type { RouterV2 } from '@masknet/web3-contracts/types/RouterV2'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useRouterV2Contract(chainId?: ChainId, address?: string) {
    return useContract<RouterV2>(chainId, address, RouterV2ABI as AbiItem[])
}
