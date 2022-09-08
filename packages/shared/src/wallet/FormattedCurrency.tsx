import { FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'
import type { FormatterCurrencyConfig } from '@masknet/web3-shared-base'

export interface FormattedCurrencyProps {
    sign?: string
    value: BigNumber.Value
    formatter?: (value: BigNumber.Value, sign?: string, symbol?: FormatterCurrencyConfig) => string
}

export const FormattedCurrency: FC<FormattedCurrencyProps> = ({
    value,
    sign,
    formatter = (value, sign) => `${sign} ${value}`.trim(),
}) => {
    return <Fragment>{formatter(value, sign)}</Fragment>
}
