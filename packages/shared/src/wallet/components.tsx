import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { makeStyles } from '@masknet/theme'
import { formatBalance, formatCurrency, formatEthereumAddress } from '@masknet/web3-shared-evm'
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
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const { value, decimals, significant, symbol } = props
    const formatted = formatBalance(value, decimals, significant)
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
