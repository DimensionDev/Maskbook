import { useChainContext, useCustomBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
import { ChainId, isNativeTokenAddress, useTokenConstants } from '@masknet/web3-shared-evm'
import { BALANCER_SWAP_TYPE } from '../../constants/index.js'
import { PluginTraderRPC } from '../../messages.js'
import { type SwapResponse, TradeStrategy } from '../../types/index.js'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useTrade(
    strategy: TradeStrategy,
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
            const isExactIn = strategy === TradeStrategy.ExactIn
            if (isZero(inputAmount) && isExactIn) return null
            if (isZero(outputAmount) && !isExactIn) return null
            // the WETH address is used for looking for available pools
            const sellToken = isNativeTokenAddress(inputToken.address) ? WNATIVE_ADDRESS : inputToken.address
            const buyToken = isNativeTokenAddress(outputToken.address) ? WNATIVE_ADDRESS : outputToken.address
            const { swaps, routes } = await PluginTraderRPC.getSwaps(
                sellToken,
                buyToken,
                isExactIn ? BALANCER_SWAP_TYPE.EXACT_IN : BALANCER_SWAP_TYPE.EXACT_OUT,
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
