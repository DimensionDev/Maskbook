import {
    ChainId,
    isNativeTokenAddress,
    SchemaType,
    useRPCConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages.js'
import type { SwapRouteData, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { first } from 'lodash-unified'
import { useChainContext, useDoubleBlockBeatRetry } from '@masknet/web3-hooks-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { FungibleToken, isZero } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): AsyncStateRetry<SwapRouteData | null> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { RPC_URLS } = useRPCConstants(chainId)
    const providerURL = first(RPC_URLS)
    const { DODO_ETH_ADDRESS } = useTraderConstants(chainId)

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken) return null
            if (isZero(inputAmount)) return null
            const sellToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: DODO_ETH_ADDRESS ?? '' }
                : inputToken
            const buyToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: DODO_ETH_ADDRESS ?? '' }
                : outputToken
            return PluginTraderRPC.swapRoute({
                isNativeSellToken: isNativeTokenAddress(inputToken.address),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage: slippage / 100,
                userAddr: account,
                rpc: providerURL,
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
            providerURL,
            chainId,
        ],
    )
}
