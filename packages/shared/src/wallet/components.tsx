import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import { formatBalance, formatCurrency, formatEthereumAddress } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => ({
    balance: {
        marginRight: theme.spacing(0.5),
    },
}))

export interface FormattedBalanceProps extends withClasses<'balance' | 'symbol'> {
    value: BigNumber.Value | undefined
    decimals?: number
    significant?: number
    symbol?: string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const { value, decimals, significant, symbol, classes } = props
    const formatted = formatBalance(value, decimals, significant)
    const ordinaryClasses = useStyles()
    if (symbol)
        return (
            <Fragment>
                <span className={classNames(ordinaryClasses.balance, classes?.balance)}>{formatted}</span>
                <span className={classes?.symbol}>{symbol}</span>
            </Fragment>
        )
    return <Fragment>{formatted}</Fragment>
}

export interface FormattedCurrencyProps {
    sign?: string
    symbol?: string
    value: BigNumber.Value
}

export const FormattedCurrency: FC<FormattedCurrencyProps> = ({ value, sign, symbol }) => {
    const formatted = formatCurrency(value, sign)
    if (symbol) return <Fragment>{`${formatted} ${symbol}`}</Fragment>
    return <Fragment>{formatted}</Fragment>
}

interface FormattedEthereumAddressProps {
    address?: string
    size?: number
}

export const FormattedAddress: FC<FormattedEthereumAddressProps> = ({ address, size }) => {
    if (!address) return null
    const formatted = formatEthereumAddress(address, size)
    return <Fragment>{formatted}</Fragment>
}
