import { FC, Fragment } from 'react'
import type { BigNumber } from 'bignumber.js'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '../UI/UIHelper/custom-ui-helper'

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
    formatter?: (value: BigNumber.Value, decimals?: number, significant?: number) => string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const { value, decimals, significant, symbol, formatter = (value) => value } = props
    const formatted = formatter(value ?? '0', decimals, significant)
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
