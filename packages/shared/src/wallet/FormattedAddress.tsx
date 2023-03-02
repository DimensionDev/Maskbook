import { type FC } from 'react'
import { identity } from 'lodash-es'

export interface FormattedAddressProps {
    address?: string
    size?: number
    formatter?: (address: string, size?: number) => string
}

export const FormattedAddress: FC<FormattedAddressProps> = ({ address, size, formatter = identity }) => {
    if (!address) return null
    return <>{formatter(address, size)}</>
}
