import { Fragment } from 'react'
import { identity } from 'lodash-es'

export interface FormattedAddressProps {
    address?: string
    size?: number
    formatter?: (address: string, size?: number) => string
}

export const FormattedAddress = ({ address, size, formatter = identity }: FormattedAddressProps) => {
    if (!address) return null
    return <Fragment>{formatter(address, size)}</Fragment>
}
