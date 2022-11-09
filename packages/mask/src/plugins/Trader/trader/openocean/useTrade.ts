import { first } from 'lodash-es'
import { ChainId, isNativeTokenAddress, useRPCConstants, useTraderConstants } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages.js'
import type { SwapOOData, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { OPENOCEAN_SUPPORTED_CHAINS } from './constants.js'
import { useChainContext, useDoubleBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
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
    temporarySlippage?: number,
): AsyncStateRetry<SwapOOData | null> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { RPC_URLS } = useRPCConstants(chainId)
    const providerURL = first(RPC_URLS)
    const { OPENOCEAN_ETH_ADDRESS } = useTraderConstants(chainId)

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (pluginID !== NetworkPluginID.PLUGIN_EVM || !OPENOCEAN_SUPPORTED_CHAINS.includes(chainId as ChainId))
                return null
            if (!inputToken || !outputToken) return null
            if (isZero(inputAmount)) return null
            const sellToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
                : inputToken
            const buyToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
                : outputToken
            return PluginTraderRPC.swapOO({
                isNativeSellToken: isNativeTokenAddress(inputToken.address),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage,
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
            pluginID,
        ],
    )
}
