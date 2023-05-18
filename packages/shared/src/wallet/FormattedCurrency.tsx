import type { BigNumber } from 'bignumber.js'

export interface FormattedCurrencyProps {
    sign?: string
    value: BigNumber.Value
    formatter?: (value: BigNumber.Value, sign?: string) => string
}

export function FormattedCurrency({
    value,
    sign,
    // it's a BigNumber so it's ok
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    formatter = (value, sign) => `${sign} ${value}`.trim(),
}: FormattedCurrencyProps) {
    return <>{formatter(value, sign)}</>
}
