import { Fragment } from 'react'
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

    formatter = (value, sign) => `${sign} ${value}`.trim(),
}: FormattedCurrencyProps) {
    return <Fragment>{formatter(value, sign)}</Fragment>
}
