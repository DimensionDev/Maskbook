import type { AbiItem } from 'web3-utils'
import SwapRouterABI from '@masknet/web3-contracts/abis/SwapRouter.json'
import type { SwapRouter } from '@masknet/web3-contracts/types/SwapRouter'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useSwapRouterContract(chainId?: ChainId, address?: string) {
    return useContract<SwapRouter>(chainId, address, SwapRouterABI as AbiItem[])
}
