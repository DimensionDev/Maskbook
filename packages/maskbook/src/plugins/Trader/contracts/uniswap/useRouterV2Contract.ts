import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '@masknet/contracts/abis/RouterV2.json'
import { useConstant, useContract } from '@masknet/web3-shared'
import { TRADE_CONSTANTS } from '../../constants'
import type { RouterV2 } from '@masknet/contracts/types/RouterV2'

export function useRouterV2Contract() {
    const address = useConstant(TRADE_CONSTANTS, 'UNISWAP_ROUTER_ADDRESS')
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[])
}
