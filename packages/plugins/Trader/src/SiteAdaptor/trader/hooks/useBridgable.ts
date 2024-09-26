import { t } from '@lingui/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useSwap } from '../contexts/index.js'
import { useBridgeSpender } from './useBridgeSpender.js'

export function useBridgable(): [result: boolean, message?: string] {
    const { inputAmount, fromToken, toToken, bridgeQuote, bridgeQuoteErrorMessage } = useSwap()
    const { data: spender, isLoading: isLoadingSpender } = useBridgeSpender()

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

    if (!bridgeQuote) return [false, bridgeQuoteErrorMessage || t`Failed to get quote information`]

    return [true]
}
