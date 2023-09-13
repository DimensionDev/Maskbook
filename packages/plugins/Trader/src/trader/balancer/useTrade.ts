import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useChainContext, useCustomBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
import { ChainId, isNativeTokenAddress, useTokenConstants } from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TraderAPI } from '@masknet/web3-providers/types'
import { SwapType, type SwapResponse } from '../../types/index.js'
import { Balancer } from '../../providers/index.js'

export function useTrade(
    strategy: TraderAPI.TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
): AsyncStateRetry<SwapResponse | null> {
    const { chainId: targetChainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    return useCustomBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!WNATIVE_ADDRESS || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
            if (!inputToken || !outputToken) return null
            const isExactIn = strategy === TraderAPI.TradeStrategy.ExactIn
            if (isZero(inputAmount) && isExactIn) return null
            if (isZero(outputAmount) && !isExactIn) return null
            // the WETH address is used for looking for available pools
            const sellToken = isNativeTokenAddress(inputToken.address) ? WNATIVE_ADDRESS : inputToken.address
            const buyToken = isNativeTokenAddress(outputToken.address) ? WNATIVE_ADDRESS : outputToken.address
            const { swaps, routes } = await Balancer.getSwaps(
                sellToken,
                buyToken,
                isExactIn ? SwapType.EXACT_IN : SwapType.EXACT_OUT,
                isExactIn ? inputAmount : outputAmount,
                targetChainId as ChainId,
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
            pluginID,
        ],
        targetChainId === ChainId.BSC ? 6 : 3,
    )
}
