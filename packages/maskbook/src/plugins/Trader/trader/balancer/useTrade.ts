import { useAsyncRetry } from 'react-use'
import { CONSTANTS } from '../../../../web3/constants'
import { useBlockNumber, useChainId } from '../../../../web3/hooks/useChainState'
import { useConstant } from '../../../../web3/hooks/useConstant'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { BALANCER_SWAP_TYPE, TRADE_CONSTANTS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapResponse, TradeStrategy } from '../../types'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const WETH_ADDRESS = useConstant(CONSTANTS, 'WETH_ADDRESS')
    const BALANCER_ETH_ADDRESS = useConstant(TRADE_CONSTANTS, 'BALANCER_ETH_ADDRESS')

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        // the WETH address is used for looking for available pools
        const sellToken = inputToken.address === ETH_ADDRESS ? WETH_ADDRESS : inputToken.address
        const buyToken = outputToken.address === ETH_ADDRESS ? WETH_ADDRESS : outputToken.address
        const { swaps, routes } = await PluginTraderRPC.getSwaps(
            sellToken,
            buyToken,
            isExactIn ? BALANCER_SWAP_TYPE.EXACT_IN : BALANCER_SWAP_TYPE.EXACT_OUT,
            isExactIn ? inputAmount : outputAmount,
        )
        // no pool found
        if (!swaps[0].length) return null
        return { swaps, routes } as SwapResponse
    }, [
        ETH_ADDRESS,
        WETH_ADDRESS,
        BALANCER_ETH_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        blockNumber, // refresh api each block
    ])
}
