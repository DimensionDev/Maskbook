import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { formatBalance, formatCurrency, formatEthereumAddress } from '@masknet/web3-shared'

export interface FormattedBalanceProps {
    value: BigNumber.Value | undefined
    decimals?: number
    significant?: number
    symbol?: string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    const formatted = formatBalance(props.value, props.decimals, props.significant)
    if (props.symbol) return <Fragment>{`${formatted} ${props.symbol}`}</Fragment>
    return <Fragment>{formatted}</Fragment>
}

export interface FormattedCurrencyProps {
    sign?: string
    symbol?: string
    value: BigNumber.Value
}

export const FormattedCurrency: FC<FormattedCurrencyProps> = (props) => {
    const formatted = formatCurrency(props.value, props.sign)
    if (props.symbol) return <Fragment>{`${formatted} ${props.symbol}`}</Fragment>
    return <Fragment>{formatted}</Fragment>
}

interface FormattedEthereumAddressProps {
    address: string
    size?: number
}

export const FormattedAddress: FC<FormattedEthereumAddressProps> = (props) => {
    const formatted = formatEthereumAddress(props.address, props.size)
    return <Fragment>{formatted}</Fragment>
}
