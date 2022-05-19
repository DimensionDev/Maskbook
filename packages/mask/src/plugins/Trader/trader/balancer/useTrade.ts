import { useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import { ChainId, isNativeTokenAddress, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { BALANCER_SWAP_TYPE } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { SwapResponse, TradeStrategy } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
): AsyncStateRetry<SwapResponse | null> {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!WNATIVE_ADDRESS) return null
            if (!inputToken || !outputToken) return null
            const isExactIn = strategy === TradeStrategy.ExactIn
            if (inputAmount === '0' && isExactIn) return null
            if (outputAmount === '0' && !isExactIn) return null
            // the WETH address is used for looking for available pools
            const sellToken = isNativeTokenAddress(inputToken) ? WNATIVE_ADDRESS : inputToken.address
            const buyToken = isNativeTokenAddress(outputToken) ? WNATIVE_ADDRESS : outputToken.address
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
        },
        [
            WNATIVE_ADDRESS,
            strategy,
            targetChainId,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
        ],
    )
}
