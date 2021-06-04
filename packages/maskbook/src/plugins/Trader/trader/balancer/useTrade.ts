import { useAsyncRetry } from 'react-use'
import {
    TOKEN_CONSTANTS,
    FungibleTokenDetailed,
    isNative,
    useConstant,
    useBlockNumber,
} from '@dimensiondev/web3-shared'
import { BALANCER_SWAP_TYPE, TRADE_CONSTANTS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapResponse, TradeStrategy } from '../../types'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const blockNumber = useBlockNumber()
    const WETH_ADDRESS = useConstant(TOKEN_CONSTANTS, 'WETH_ADDRESS')
    const NATIVE_TOKEN_ADDRESS = useConstant(TOKEN_CONSTANTS, 'NATIVE_TOKEN_ADDRESS')
    const BALANCER_ETH_ADDRESS = useConstant(TRADE_CONSTANTS, 'BALANCER_ETH_ADDRESS')

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        // the WETH address is used for looking for available pools
        const sellToken = isNative(inputToken.address) ? WETH_ADDRESS : inputToken.address
        const buyToken = isNative(outputToken.address) ? WETH_ADDRESS : outputToken.address
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
        NATIVE_TOKEN_ADDRESS,
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
