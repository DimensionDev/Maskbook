import { first } from 'lodash-unified'
import {
    FungibleTokenDetailed,
    isNativeTokenAddress,
    useAccount,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { SwapOOData, TradeStrategy } from '../../types'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useSlippageTolerance } from './useSlippageTolerance'
import { OPENOCEAN_SUPPORTED_CHAINS } from './constants'
import { useDoubleBlockBeatRetry } from '@masknet/plugin-infra/web3'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
    temporarySlippage?: number,
): AsyncStateRetry<SwapOOData | null> {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { RPC } = useRPCConstants(targetChainId)
    const providerURL = first(RPC)
    const { OPENOCEAN_ETH_ADDRESS } = useTraderConstants(targetChainId)
    const account = useAccount()

    return useDoubleBlockBeatRetry(async () => {
        if (!OPENOCEAN_SUPPORTED_CHAINS.includes(targetChainId)) return null
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
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
            chainId: targetChainId,
        })
    }, [
        NATIVE_TOKEN_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        account,
        providerURL,
        targetChainId,
    ])
}
