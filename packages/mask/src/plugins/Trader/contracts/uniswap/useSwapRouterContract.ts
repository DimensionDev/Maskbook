import type { AbiItem } from 'web3-utils'
import SwapRouterABI from '@masknet/web3-contracts/abis/SwapRouter.json'
import type { SwapRouter } from '@masknet/web3-contracts/types/SwapRouter'
import { ChainId, useChainId, useContract } from '@masknet/web3-shared-evm'

export function useSwapRouterContract(address?: string, chainId?: ChainId) {
    const _chainId = useChainId()
    return useContract<SwapRouter>(chainId ?? _chainId, address, SwapRouterABI as AbiItem[])
}
