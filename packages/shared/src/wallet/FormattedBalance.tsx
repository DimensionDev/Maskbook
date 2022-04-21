import { FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'
import { isZero, isLessThan } from '@masknet/web3-shared-base'
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
    minimumBalance?: BigNumber.Value
    formatter?: (value: BigNumber.Value, decimals?: number, significant?: number) => string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const { value, decimals, significant, symbol, minimumBalance, formatter = (value) => value } = props
    let formatted = formatter(value ?? '0', decimals, significant)
    if (minimumBalance && value && !isZero(formatted) && isLessThan(value, minimumBalance)) {
        formatted = '<' + formatter(minimumBalance, decimals, significant)
    }
    const classes = useStylesExtends(useStyles(), props)

    if (symbol)
        return (
            <Fragment>
                <span className={classes.balance}>{String(formatted)}</span>
                <span className={classes?.symbol}>{symbol}</span>
            </Fragment>
        )
    return <Fragment>{String(formatted)}</Fragment>
}
