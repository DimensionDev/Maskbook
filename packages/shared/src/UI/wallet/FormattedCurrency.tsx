import type { BigNumber } from 'bignumber.js'
import { useCurrencyType, useFiatCurrencyRate } from '@masknet/web3-hooks-base'
import { CurrencyType, type FormatterCurrencyOptions } from '@masknet/web3-shared-base'

export interface FormattedCurrencyProps {
    sign?: string
    value?: BigNumber.Value
    options?: FormatterCurrencyOptions
    formatter?: (value: BigNumber.Value, sign?: string, options?: FormatterCurrencyOptions) => string
}

// it's a BigNumber so it's ok
// eslint-disable-next-line @typescript-eslint/no-base-to-string
const defaultFormatter: FormattedCurrencyProps['formatter'] = (value, sign) => `${sign} ${value}`.trim()
export function FormattedCurrency({ value = 0, sign, options, formatter = defaultFormatter! }: FormattedCurrencyProps) {
    const currentSign = useCurrencyType()
    const { data: currentFiatCurrencyRate } = useFiatCurrencyRate()
    const rate = options?.fiatCurrencyRate ?? (sign === CurrencyType.USD ? 1 : currentFiatCurrencyRate)

    return (
        <>
            {formatter(value, rate === 1 ? CurrencyType.USD : (sign ?? currentSign), {
                ...options,
                fiatCurrencyRate: rate,
            })}
        </>
    )
}
