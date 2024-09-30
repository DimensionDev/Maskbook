import { t } from '@lingui/macro'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isLessThan, rightShift } from '@masknet/web3-shared-base'
import { useTrade } from '../contexts/index.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useSpender } from './useSpender.js'

export function useSwappable(): [result: boolean, message?: string] {
    const { inputAmount, fromToken, quote } = useTrade()
    const chainId = fromToken?.chainId as ChainId
    const { data: spender, isLoading: isLoadingSpender } = useSpender('swap')
    const { data: balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, fromToken?.address, { chainId })

    if (!spender && !isLoadingSpender) return [false, t`Missing dex contract address`]
    if (!inputAmount || !fromToken) return [false, t`Enter an Amount`]

    const amount = rightShift(inputAmount, fromToken.decimals)

    const symbol = fromToken.symbol
    if (isLessThan(balance || 0, amount)) return [false, t`Insufficient ${symbol} Balance`]

    if (!quote) return [false]

    return [true]
}
