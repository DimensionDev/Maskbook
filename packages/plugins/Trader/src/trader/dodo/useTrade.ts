import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { Dodo } from '@masknet/web3-providers'
import { isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID, type UnboxPromise } from '@masknet/shared-base'
import { ChainId, ProviderURL, isNativeTokenAddress, useTraderConstants } from '@masknet/web3-shared-evm'
import { useChainContext, useCustomBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TradeStrategy } from '@masknet/web3-providers/types'
import { useSlippageTolerance } from './useSlippageTolerance.js'

type SwapRouteData = UnboxPromise<ReturnType<typeof Dodo.swapRoute>> | null

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): AsyncStateRetry<SwapRouteData> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { DODO_ETH_ADDRESS } = useTraderConstants(chainId as ChainId)

    return useCustomBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
            if (isZero(inputAmount)) return null
            const sellToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: DODO_ETH_ADDRESS ?? '' }
                : inputToken
            const buyToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: DODO_ETH_ADDRESS ?? '' }
                : outputToken
            return Dodo.swapRoute({
                isNativeSellToken: isNativeTokenAddress(inputToken.address),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage: slippage / 100,
                userAddr: account,
                rpc: ProviderURL.from(chainId as ChainId),
                chainId,
            })
        },
        [
            strategy,
            inputAmount,
            outputAmount,
            inputToken?.address,
            outputToken?.address,
            slippage,
            account,
            chainId,
            pluginID,
        ],
        chainId === ChainId.BSC ? 6 : 3,
    )
}
