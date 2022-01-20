import { FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'
import { makeStyles, useStylesExtends } from '@masknet/theme'

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
    minimumBalance?: number
    formatter?: (value: BigNumber.Value, decimals?: number, significant?: number) => string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const { value, decimals, significant, symbol, minimumBalance, formatter = (value) => value } = props
    const formatted =
        Number(formatter(value ?? '0', decimals, significant)) === 0
            ? '0'
            : minimumBalance
            ? Number(formatter(value ?? '0', decimals, significant)) < minimumBalance
                ? '<' + minimumBalance.toString()
                : formatter(value ?? '0', decimals, significant)
            : formatter(value ?? '0', decimals, significant)
    const classes = useStylesExtends(useStyles(), props)

    if (symbol)
        return (
            <Fragment>
                <span className={classes.balance}>{formatted}</span>
                <span className={classes?.symbol}>{symbol}</span>
            </Fragment>
        )
    return <Fragment>{formatted}</Fragment>
}
