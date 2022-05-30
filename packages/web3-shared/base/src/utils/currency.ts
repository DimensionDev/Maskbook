import BigNumber from 'bignumber.js'

export function formatCurrency(value: BigNumber.Value, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(
        new BigNumber(value).toNumber(),
    )
}
