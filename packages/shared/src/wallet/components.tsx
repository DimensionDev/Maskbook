import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { formatBalance, formatCurrency, formatEthereumAddress } from '@masknet/web3-shared'

export interface FormattedBalanceProps {
    value: BigNumber.Value | undefined
    decimals?: number
    significant?: number
    symbol?: string
}

export const FormattedBalance: FC<FormattedBalanceProps> = ({ value, decimals, significant, symbol }) => {
    const formatted = formatBalance(value, decimals, significant)
    if (symbol) return <Fragment>{`${formatted} ${symbol}`}</Fragment>
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
