import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '@dimensiondev/contracts/abis/RouterV2.json'
import { useConstant, useContract } from '@dimensiondev/web3-shared'
import { TRADE_CONSTANTS } from '../../constants'
import type { RouterV2 } from '@dimensiondev/contracts/types/RouterV2'

export function useRouterV2Contract() {
    const address = useConstant(TRADE_CONSTANTS, 'UNISWAP_ROUTER_ADDRESS')
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[])
}
