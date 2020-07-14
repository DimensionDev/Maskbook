import React, { useCallback } from 'react'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import { IconButton, IconButtonProps } from '@material-ui/core'

export interface TransferButtonProps extends IconButtonProps {}

export function TransferButton({ ...props }: TransferButtonProps) {
    const onTransfer = useCallback(() => {
        console.log("DEBUG: let's transfer")
    }, [])
    return (
        <IconButton color="default" onClick={onTransfer} {...props}>
            <AttachMoneyIcon />
        </IconButton>
    )
}
