import { FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'

export interface FormattedCurrencyProps {
    sign?: string
    symbol?: string
    value: BigNumber.Value
    formatter?: (value: BigNumber.Value, sign?: string, symbol?: string) => string
}

export const FormattedCurrency: FC<FormattedCurrencyProps> = ({
    value,
    sign,
    symbol,
    formatter = (value, sign, symbol) => `${sign} ${value} ${symbol?.toUpperCase()}`.trim(),
}) => {
    return <Fragment>{formatter(value, sign, symbol)}</Fragment>
}
