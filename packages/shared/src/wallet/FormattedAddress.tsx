import { identity } from 'lodash-es'

export interface FormattedAddressProps {
    address?: string
    size?: number
    formatter?: (address: string, size?: number) => string
}

export function FormattedAddress({ address, size, formatter = identity }: FormattedAddressProps) {
    if (!address) return null
    return <>{formatter(address, size)}</>
}
