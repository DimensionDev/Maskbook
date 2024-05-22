import { BigNumber } from 'bignumber.js'
import { isZero, isLessThan, type FormatBalanceOptions } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { identity } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    balance: {
        marginRight: theme.spacing(0.5),
    },
}))

export interface FormattedBalanceProps extends withClasses<'balance' | 'symbol'> {
    value: BigNumber.Value | undefined
    decimals?: number
    significant?: number
    symbol?: string
    minimumBalance?: BigNumber.Value
    formatter?: (value: BigNumber.Value, decimals?: number, options?: FormatBalanceOptions) => string
}

export function FormattedBalance(props: FormattedBalanceProps) {
    const {
        value,
        decimals,
        significant,
        symbol,
        minimumBalance,
        formatter = identity as NonNullable<FormattedBalanceProps['formatter']>,
    } = props
    const valueInt = new BigNumber(value ?? '0').toFixed(0)
    let formatted = formatter(valueInt, decimals, { significant })
    if (minimumBalance && !isZero(formatted) && isLessThan(valueInt, minimumBalance)) {
        // it's a BigNumber so it's ok

        formatted = '<' + formatter(minimumBalance, decimals, { significant })
    }
    const { classes } = useStyles(undefined, { props })

    if (symbol)
        return (
            <>
                <span className={classes.balance}>{String(formatted)}</span>
                <span className={classes.symbol}>{symbol}</span>
            </>
        )
    return <>{String(formatted)}</>
}
