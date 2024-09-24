import { t } from '@lingui/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import { useSwap } from '../contexts/index.js'

export function useSwappable(): [result: boolean, message?: string] {
    const { inputAmount, chainId, fromToken, quote } = useSwap()
    const { data: balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, fromToken?.address, { chainId })
    if (!inputAmount || !fromToken) return [false, t`Enter an Amount`]

    const amount = rightShift(inputAmount, fromToken.decimals)

    const symbol = fromToken.symbol
    if (isLessThan(balance || 0, amount)) return [false, t`Insufficient ${symbol} Balance`]

    if (!quote) return [false]

    return [true]
}
