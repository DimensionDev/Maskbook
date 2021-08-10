import SwapRouterABI from '@masknet/web3-contracts/abis/SwapRouter.json'
import type { SwapRouter } from '@masknet/web3-contracts/types/SwapRouter'
import { useContract, useTraderConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useSwapRouterContract() {
    const { UNISWAP_SWAP_ROUTER_ADDRESS } = useTraderConstants()
    return useContract<SwapRouter>(UNISWAP_SWAP_ROUTER_ADDRESS, SwapRouterABI as AbiItem[])
}
