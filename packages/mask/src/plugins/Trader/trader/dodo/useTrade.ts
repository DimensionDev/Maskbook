import {
    FungibleTokenDetailed,
    isNativeTokenAddress,
    useAccount,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import type { TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { first } from 'lodash-unified'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useDoubleBlockBeatRetry } from '@masknet/web3-shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const slippage = useSlippageTolerance()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const { RPC } = useRPCConstants(chainId)
    const providerURL = first(RPC)
    const { DODO_ETH_ADDRESS } = useTraderConstants(chainId)
    const account = useAccount()

    return useDoubleBlockBeatRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
        const sellToken = isNativeTokenAddress(inputToken)
            ? { ...inputToken, address: DODO_ETH_ADDRESS ?? '' }
            : inputToken
        const buyToken = isNativeTokenAddress(outputToken)
            ? { ...outputToken, address: DODO_ETH_ADDRESS ?? '' }
            : outputToken
        return PluginTraderRPC.swapRoute({
            isNativeSellToken: isNativeTokenAddress(inputToken),
            fromToken: sellToken,
            toToken: buyToken,
            fromAmount: inputAmount,
            slippage: slippage / 100,
            userAddr: account,
            rpc: providerURL,
            chainId,
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
        chainId,
    ])
}
