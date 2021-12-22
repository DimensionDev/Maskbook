import {
    FungibleTokenDetailed,
    isZeroAddress,
    useAccount,
    useBlockNumber,
    useRPCConstants,
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
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { RPC } = useRPCConstants(chainId)
    const providerURL = first(RPC)
    const { DODO_ETH_ADDRESS } = useTraderConstants(chainId)
    const account = useAccount()

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
        const sellToken = isZeroAddress(inputToken.address)
            ? { ...inputToken, address: DODO_ETH_ADDRESS ?? '' }
            : inputToken
        const buyToken = isZeroAddress(outputToken.address)
            ? { ...outputToken, address: DODO_ETH_ADDRESS ?? '' }
            : outputToken
        return PluginTraderRPC.swapRoute({
            isNativeSellToken: isZeroAddress(inputToken.address),
            fromToken: sellToken,
            toToken: buyToken,
            fromAmount: inputAmount,
            slippage: slippage / 100,
            userAddr: account,
            rpc: providerURL,
            chainId,
        })
    }, [
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        blockNumber, // refresh api each block
        account,
        providerURL,
        chainId,
    ])
}
