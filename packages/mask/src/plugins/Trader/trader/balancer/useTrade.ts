import {
    FungibleTokenDetailed,
    isNativeTokenAddress,
    useBlockNumber,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { BALANCER_SWAP_TYPE } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapResponse, TradeStrategy } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const blockNumber = useBlockNumber()
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    return useAsyncRetry(async () => {
        if (!WNATIVE_ADDRESS) return null
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        // the WETH address is used for looking for available pools
        const sellToken = isNativeTokenAddress(inputToken.address) ? WNATIVE_ADDRESS : inputToken.address
        const buyToken = isNativeTokenAddress(outputToken.address) ? WNATIVE_ADDRESS : outputToken.address
        const { swaps, routes } = await PluginTraderRPC.getSwaps(
            sellToken,
            buyToken,
            isExactIn ? BALANCER_SWAP_TYPE.EXACT_IN : BALANCER_SWAP_TYPE.EXACT_OUT,
            isExactIn ? inputAmount : outputAmount,
            targetChainId,
        )
        // no pool found
        if (!swaps[0].length) return null
        return { swaps, routes } as SwapResponse
    }, [
        WNATIVE_ADDRESS,
        strategy,
        targetChainId,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        blockNumber, // refresh api each block
    ])
}
