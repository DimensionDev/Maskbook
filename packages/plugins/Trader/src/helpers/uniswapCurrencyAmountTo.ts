import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { pow10 } from '@masknet/web3-shared-base'

export function uniswapCurrencyAmountTo(currencyAmount: CurrencyAmount<Currency>) {
    return pow10(currencyAmount.currency.decimals).multipliedBy(currencyAmount.toFixed())
}
