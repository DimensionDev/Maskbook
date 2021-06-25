import RouterV2ABI from '@masknet/contracts/abis/RouterV2.json'
import type { RouterV2 } from '@masknet/contracts/types/RouterV2'
import { useContract, useTraderConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useRouterV2Contract() {
    const { UNISWAP_ROUTER_ADDRESS } = useTraderConstants()
    return useContract<RouterV2>(UNISWAP_ROUTER_ADDRESS, RouterV2ABI as AbiItem[])
}
