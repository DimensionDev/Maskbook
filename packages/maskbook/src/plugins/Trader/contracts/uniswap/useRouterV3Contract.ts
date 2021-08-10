import RouterV3Abi from '@masknet/web3-contracts/abis/RouterV3.json'
import type { RouterV3 } from '@masknet/web3-contracts/types/RouterV3'
import { useContract, useTraderConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useRouterV3Contract() {
    const { UNISWAP_V3_ROUTER_ADDRESS } = useTraderConstants()
    return useContract<RouterV3>(UNISWAP_V3_ROUTER_ADDRESS, RouterV3Abi as AbiItem[])
}
