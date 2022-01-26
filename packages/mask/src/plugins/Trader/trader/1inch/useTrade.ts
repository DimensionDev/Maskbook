import {
    FungibleTokenDetailed,
    isNativeTokenAddress,
    useAccount,
    useBlockNumber,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import type { TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { first } from 'lodash-unified'
import { TargetChainIdContext } from '../useTargetChainIdContext'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const blockNumber = useBlockNumber()
    const slippage = useSlippageTolerance()
    const { targetChainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(targetChainId)
    const { RPC } = useRPCConstants(targetChainId)
    const providerURL = first(RPC)
    const { ONEINCH_ETH_ADDRESS } = useTraderConstants(targetChainId)
    const account = useAccount()

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
        const sellToken = isNativeTokenAddress(inputToken)
            ? { ...inputToken, address: ONEINCH_ETH_ADDRESS ?? '' }
            : inputToken
        const buyToken = isNativeTokenAddress(outputToken)
            ? { ...outputToken, address: ONEINCH_ETH_ADDRESS ?? '' }
            : outputToken
        return PluginTraderRPC.swapOneQuote({
            isNativeSellToken: isNativeTokenAddress(inputToken),
            fromTokenAddress: sellToken,
            toTokenAddress: buyToken,
            amount: inputAmount,
            slippage: slippage,
            fromAddress: account,
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
        blockNumber, // refresh api each block
        account,
        providerURL,
    ])
}
