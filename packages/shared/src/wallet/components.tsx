import type { BigNumber } from 'bignumber.js'
import { FC, Fragment } from 'react'
import { formatBalance, formatChecksumAddress, formatCurrency, formatEthereumAddress, formatToken } from './formatter'

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

interface FormattedChecksumAddressProps {
    address: string
    type: 'checksum'
    size: number
}

interface FormattedEthereumAddressProps {
    address: string
    type: 'ethereum'
    size: number
}

export const FormattedAddress: FC<FormattedChecksumAddressProps | FormattedEthereumAddressProps> = (props) => {
    let formatted: string
    if (props.type === 'checksum') {
        formatted = formatChecksumAddress(props.address)
    } else if (props.type === 'ethereum') {
        formatted = formatEthereumAddress(props.address, props.size)
    } else {
        throw new Error('unsupported address type')
    }
    return <Fragment>{formatChecksumAddress(props.address)}</Fragment>
}
