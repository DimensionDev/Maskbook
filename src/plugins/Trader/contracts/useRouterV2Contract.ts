import type { AbiItem } from 'web3-utils'
import RouterV2ABI from '../../../contracts/uniswap-v2-router/RouterV2.json'
import type { RouterV2 } from '../../../contracts/uniswap-v2-router/RouterV2'
import { useContract } from '../../../web3/hooks/useContract'
import { useConstant } from '../../../web3/hooks/useConstant'

export function useRouterV2Contract() {
    const address = useConstant('ROUTER_V2_ADDRESS')
    return useContract<RouterV2>(address, RouterV2ABI as AbiItem[]) as RouterV2
}
