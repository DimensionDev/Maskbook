import { type FC, Fragment } from 'react'
import { BigNumber } from 'bignumber.js'
import { isZero, isLessThan } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'

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
    const valueInt = new BigNumber(value ?? '0').toFixed(0)
    let formatted = formatter(valueInt, decimals, significant)
    if (minimumBalance && !isZero(formatted) && isLessThan(valueInt, minimumBalance)) {
        // it's a BigNumber so it's ok

        formatted = '<' + formatter(minimumBalance, decimals, significant).toString()
    }
    const { classes } = useStyles(undefined, { props })

    if (symbol)
        return (
            <Fragment>
                <span className={classes.balance}>{String(formatted)}</span>
                <span className={classes.symbol}>{symbol}</span>
            </Fragment>
        )
    return <Fragment>{String(formatted)}</Fragment>
}
