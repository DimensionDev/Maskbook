import { t } from '@lingui/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useTrade } from '../contexts/index.js'
import { useSpender } from './useSpender.js'

export function useBridgable(): [result: boolean, message?: string] {
    const { inputAmount, fromToken, toToken, bridgeQuote, isBridgeQuoteLoading, bridgeQuoteErrorMessage } = useTrade()
    const { data: spender, isLoading: isLoadingSpender } = useSpender('bridge')

    const chainId = fromToken?.chainId as ChainId
    const { data: balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, fromToken?.address, {
        chainId,
    })

    if (!spender && !isLoadingSpender) return [false, t`Missing dex contract address`]
    if (fromToken?.chainId === toToken?.chainId) return [false, t`Try token from different chains`]
    if (!inputAmount || !fromToken) return [false, t`Enter an Amount`]

    const amount = rightShift(inputAmount, fromToken.decimals)

    const symbol = fromToken.symbol
    if (isLessThan(balance || 0, amount)) return [false, t`Insufficient ${symbol} Balance`]

    if (!bridgeQuote && !isBridgeQuoteLoading)
        return [false, bridgeQuoteErrorMessage || t`Failed to get quote information`]

    return [true]
}
