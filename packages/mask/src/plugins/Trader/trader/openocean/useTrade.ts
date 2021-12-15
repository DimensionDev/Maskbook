import {
    FungibleTokenDetailed,
    isNative,
    useAccount,
    useBlockNumber,
    useChainId,
    useRPCConstants,
    useTokenConstants,
    useTraderConstants,
} from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import type { TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { first } from 'lodash-unified'

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const blockNumber = useBlockNumber()
    const slippage = useSlippageTolerance()
    const chainId = useChainId()
    const { RPC } = useRPCConstants(chainId)
    const providerURL = first(RPC)
    const { OPENOCEAN_ETH_ADDRESS } = useTraderConstants(chainId)
    const account = useAccount()

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmount === '0') return null
        const sellToken = isNative(inputToken.address)
            ? { ...inputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
            : inputToken
        const buyToken = isNative(outputToken.address)
            ? { ...outputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
            : outputToken
        return PluginTraderRPC.swapOO({
            isNativeSellToken: isNative(inputToken.address),
            fromToken: sellToken,
            toToken: buyToken,
            fromAmount: inputAmount,
            slippage,
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
        blockNumber, // refresh api each block
        account,
        providerURL,
        chainId,
    ])
}
