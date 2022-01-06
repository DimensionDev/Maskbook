import {
    FungibleTokenDetailed,
    useAccount,
    useTokenConstants,
    useTraderConstants,
    ChainId,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy } from '../../types'
import { useSlippageTolerance } from './useSlippageTolerance'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { DOUBLE_BLOCK_DELAY, leftShift, useBeatRetry } from '@masknet/web3-shared-base'

export function useTrade(
    strategy: TradeStrategy,
    inputAmountWei: string,
    outputAmountWei: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const slippage = useSlippageTolerance()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const { BANCOR_ETH_ADDRESS } = useTraderConstants(chainId)
    const user = useAccount()

    const inputAmount = leftShift(inputAmountWei, inputToken?.decimals).toFixed()
    const outputAmount = leftShift(outputAmountWei, outputToken?.decimals).toFixed()
    const isExactIn = strategy === TradeStrategy.ExactIn

    return useBeatRetry(
        async () => {
            if (!inputToken || !outputToken) return null
            if (inputAmountWei === '0' && isExactIn) return null
            if (outputAmountWei === '0' && !isExactIn) return null
            if (![ChainId.Mainnet, ChainId.Ropsten].includes(chainId)) return null

            const fromToken = isNativeTokenAddress(inputToken)
                ? { ...inputToken, address: BANCOR_ETH_ADDRESS ?? '' }
                : inputToken

            const toToken = isNativeTokenAddress(outputToken)
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
                chainId: chainId as ChainId.Mainnet | ChainId.Ropsten,
                minimumReceived: '',
            })
        },
        DOUBLE_BLOCK_DELAY,
        [
            NATIVE_TOKEN_ADDRESS,
            strategy,
            inputAmountWei,
            outputAmountWei,
            inputToken?.address,
            outputToken?.address,
            slippage,
            user,
            chainId,
        ],
    )
}
