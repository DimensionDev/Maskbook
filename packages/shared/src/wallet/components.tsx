import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { formatBalance, formatCurrency, formatToken, formatEthereumAddress } from './formatter'

export interface FormattedBalanceProps {
    value: BigNumber.Value | undefined
    decimals?: number
    significant?: number
    symbol?: string
}

export const FormattedBalance: FC<FormattedBalanceProps> = (props) => {
    let formatted = formatBalance(props.value, props.decimals, props.significant)
    if (props.symbol) {
        formatted += ` ${props.symbol}`
    }
    return <Fragment>{formatted}</Fragment>
}

export interface FormattedCurrencyProps {
    type: 'currency'
    value: BigNumber.Value
    sign?: string
    symbol?: string
}

export interface FormattedTokenProps {
    type: 'token'
    value: BigNumber.Value
    symbol?: string
}

export const FormattedCurrency: FC<FormattedCurrencyProps | FormattedTokenProps> = (props) => {
    let formatted: string
    if (props.type === 'currency') {
        formatted = formatCurrency(props.value, props.sign)
    } else if (props.type === 'token') {
        formatted = formatToken(props.value)
    } else {
        throw new Error('unsupported currency type')
    }
    if (props.symbol) {
        formatted += ` ${props.symbol}`
    }
    return <Fragment>{formatted}</Fragment>
}

interface FormattedEthereumAddressProps {
    type: 'ethereum'
    address: string
    size?: number
}

export const FormattedAddress: FC<FormattedEthereumAddressProps> = (props) => {
    return <Fragment>{formatEthereumAddress(props.address, props.size)}</Fragment>
}
