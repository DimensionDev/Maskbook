import RouterV2ABI from '@masknet/contracts/abis/RouterV2.json'
import type { RouterV2 } from '@masknet/contracts/types/RouterV2'
import { useConstant, useContract } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'
import { TRADE_CONSTANTS } from '../../constants'

export function useRouterV2Contract() {
    const { PANCAKESWAP_ROUTER_ADDRESS } = useConstant(TRADE_CONSTANTS)
    return useContract<RouterV2>(PANCAKESWAP_ROUTER_ADDRESS, RouterV2ABI as AbiItem[])
}
