import { Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'
import { useCurrencyType, useFiatCurrencyRate } from '@masknet/web3-hooks-base'
import { CurrencyType, type FormatterCurrencyOptions } from '@masknet/web3-shared-base'

export interface FormattedCurrencyProps {
    sign?: string
    value?: BigNumber.Value
    options?: FormatterCurrencyOptions
    formatter?: (value: BigNumber.Value, sign?: string, options?: FormatterCurrencyOptions) => string
}

export function FormattedCurrency({
    value = 0,
    sign,
    options,
    // it's a BigNumber so it's ok
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    formatter = (value, sign) => `${sign} ${value}`.trim(),
}: FormattedCurrencyProps) {
    const currentSign = useCurrencyType()
    const { data: currentFiatCurrencyRate } = useFiatCurrencyRate()
    const rate = options?.fiatCurrencyRate ?? (sign === CurrencyType.USD ? 1 : currentFiatCurrencyRate)
    return (
        <Fragment>
            {formatter(value, sign ?? currentSign, {
                ...options,
                fiatCurrencyRate: rate,
            })}
        </Fragment>
    )
}
