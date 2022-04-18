import {
    FungibleTokenDetailed,
    getNetworkTypeFromChainId,
    isNativeTokenAddress,
    useAccount,
    useRPCConstants,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { WoofiSwapData, TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { first } from 'lodash-unified'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { currentNetworkSettings } from '../../../Wallet/settings'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    temporarySlippage?: number,
): AsyncStateRetry<WoofiSwapData | null> {
    const { targetChainId } = TargetChainIdContext.useContainer()

    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { WNATIVE_ADDRESS } = useTokenConstants(chainId)
    const { RPC } = useRPCConstants(chainId)
    const providerURL = first(RPC)
    const account = useAccount()

    return useDoubleBlockBeatRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
        const sellToken = isNativeTokenAddress(inputToken)
            ? { ...inputToken, address: WNATIVE_ADDRESS ?? '' }
            : inputToken
        const buyToken = isNativeTokenAddress(outputToken)
            ? { ...outputToken, address: WNATIVE_ADDRESS ?? '' }
            : outputToken
        return PluginTraderRPC.woofiSwap(
            {
                isNativeSellToken: isNativeTokenAddress(inputToken),
                fromToken: sellToken,
                toToken: buyToken,
                fromAmount: inputAmount,
                slippage: slippage / 100,
                userAddr: account,
                rpc: providerURL,
                chainId,
            },
            getNetworkTypeFromChainId(targetChainId) ?? currentNetworkSettings.value,
        )
    }, [
        WNATIVE_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        account,
        providerURL,
        chainId,
    ])
}
