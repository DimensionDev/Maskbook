import { AddressViewer } from '@masknet/shared'
import { AddressName } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface TabHeaderProps {
    addressName: AddressName
    addressLabel: string
    children?: ReactNode
}

export const TabHeader = ({ addressName, addressLabel, children }: TabHeaderProps) => {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between">
            <div>{children}</div>
            <AddressViewer addressName={addressName} />
        </Box>
    )
}
