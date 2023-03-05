import { type FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'

export interface FormattedCurrencyProps {
    sign?: string
    value: BigNumber.Value
    formatter?: (value: BigNumber.Value, sign?: string) => string
}

export const FormattedCurrency: FC<FormattedCurrencyProps> = ({
    value,
    sign,
    // it's a BigNumber so it's ok
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    formatter = (value, sign) => `${sign} ${value}`.trim(),
}) => {
    return <Fragment>{formatter(value, sign)}</Fragment>
}
