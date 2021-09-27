import {
    FungibleTokenDetailed,
    isNative,
    useAccount,
    useBlockNumber,
    useChainId,
    useTokenConstants,
    useTraderConstants,
    pow10,
    ChainId,
} from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import BigNumber from 'bignumber.js'

export function useTrade(
    strategy: TradeStrategy,
    inputAmountWei: string,
    outputAmountWei: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const blockNumber = useBlockNumber()
    const slippage = useSlippageTolerance()
    const chainId = useChainId() as ChainId.Mainnet | ChainId.Ropsten
    const { BANCOR_ETH_ADDRESS } = useTraderConstants(chainId)
    const user = useAccount()

    const inputAmount = new BigNumber(inputAmountWei).dividedBy(pow10(inputToken?.decimals ?? 0)).toFixed()
    const outputAmount = new BigNumber(outputAmountWei).dividedBy(pow10(outputToken?.decimals ?? 0)).toFixed()
    const isExactIn = strategy === TradeStrategy.ExactIn

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        if (inputAmountWei === '0' && isExactIn) return null
        if (outputAmountWei === '0' && !isExactIn) return null
        if (![ChainId.Mainnet, ChainId.Ropsten].includes(chainId)) return null

        const fromToken = isNative(inputToken.address)
            ? { ...inputToken, address: BANCOR_ETH_ADDRESS ?? '' }
            : inputToken

        const toToken = isNative(outputToken.address)
            ? { ...outputToken, address: BANCOR_ETH_ADDRESS ?? '' }
            : outputToken

        return PluginTraderRPC.swapBancor({
            strategy,
            fromToken,
            toToken,
            fromAmount: isExactIn ? inputAmount : void 0,
            toAmount: isExactIn ? void 0 : outputAmount,
            slippage,
            user,
            chainId,
            minimumReceived: '',
        })
    }, [
        NATIVE_TOKEN_ADDRESS,
        strategy,
        inputAmountWei,
        outputAmountWei,
        inputToken?.address,
        outputToken?.address,
        slippage,
        blockNumber, // refresh api each block
        user,
        chainId,
    ])
}
