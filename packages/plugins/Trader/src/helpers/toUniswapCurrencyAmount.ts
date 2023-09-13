import { CurrencyAmount } from '@uniswap/sdk-core'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isGreaterThan } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { toUniswapCurrency } from './toUniswapCurrency.js'

export function toUniswapCurrencyAmount(chainId?: ChainId, token?: Web3Helper.FungibleTokenAll, amount?: string) {
    if (!token || !amount || !chainId) return
    const currency = toUniswapCurrency(chainId, token)
    if (!currency) return
    try {
        if (isGreaterThan(amount, 0)) return CurrencyAmount.fromRawAmount(currency, amount)
    } catch {
        return
    }
    return
}
