import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '@masknet/contracts/abis/RouterV2.json'
import { TRADE_CONSTANTS } from '../../constants'
import type { RouterV2 } from '@masknet/contracts/types/RouterV2'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useRouterV2Contract() {
    const { SASHIMISWAP_ROUTER_ADDRESS } = useConstant(TRADE_CONSTANTS)
    return useContract<RouterV2>(SASHIMISWAP_ROUTER_ADDRESS, RouterV2ABI as AbiItem[])
}
