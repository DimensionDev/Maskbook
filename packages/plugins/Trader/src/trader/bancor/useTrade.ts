import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useTraderConstants, ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { leftShift } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useCustomBlockBeatRetry, useNetworkContext } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../../messages.js'
import { type SwapBancorRequest, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from './useSlippageTolerance.js'

export function useTrade(
    strategy: TradeStrategy,
    inputAmountWei: string,
    outputAmountWei: string,
    inputToken?: Web3Helper.FungibleTokenAll,
    outputToken?: Web3Helper.FungibleTokenAll,
    temporarySlippage?: number,
): AsyncStateRetry<SwapBancorRequest | null> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { chainId, account } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { BANCOR_ETH_ADDRESS } = useTraderConstants(chainId)

    const inputAmount = leftShift(inputAmountWei, inputToken?.decimals).toFixed()
    const outputAmount = leftShift(outputAmountWei, outputToken?.decimals).toFixed()
    const isExactIn = strategy === TradeStrategy.ExactIn

    return useCustomBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken || pluginID !== NetworkPluginID.PLUGIN_EVM) return null
            if (inputAmountWei === '0' && isExactIn) return null
            if (outputAmountWei === '0' && !isExactIn) return null
            if (![ChainId.Mainnet, ChainId.Ropsten].includes(chainId as ChainId)) return null

            const fromToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: BANCOR_ETH_ADDRESS ?? '' }
                : inputToken

            const toToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: BANCOR_ETH_ADDRESS ?? '' }
                : outputToken

            return PluginTraderRPC.swapBancor({
                strategy,
                fromToken,
                toToken,
                fromAmount: isExactIn ? inputAmount : void 0,
                toAmount: isExactIn ? void 0 : outputAmount,
                slippage,
                user: account,
                chainId: chainId as ChainId.Mainnet | ChainId.Ropsten,
                minimumReceived: '',
            })
        },
        [
            strategy,
            inputAmountWei,
            outputAmountWei,
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
