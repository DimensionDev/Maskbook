import SwapRouterABI from '@masknet/web3-contracts/abis/SwapRouter.json'
import type { SwapRouter } from '@masknet/web3-contracts/types/SwapRouter'
import { ChainId, useContract } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'

export function useSwapRouterContract(address?: string, chainId?: ChainId) {
    return useContract<SwapRouter>(address, SwapRouterABI as AbiItem[], false, chainId)
}
