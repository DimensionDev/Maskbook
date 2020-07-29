import React from 'react'
import MiddleEllipsis from 'react-middle-ellipsis'

export interface AddressProps {
    address: string
}

export function Address(props: AddressProps) {
    return (
        <MiddleEllipsis>
            <span className="ellipseMe">{props.address}</span>
        </MiddleEllipsis>
    )
}
