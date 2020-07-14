import React, { useCallback } from 'react'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import { IconButton, IconButtonProps } from '@material-ui/core'

export interface TransferButtonProps extends IconButtonProps {}

export function TransferButton({ ...props }: TransferButtonProps) {
    return (
        <IconButton color="default" {...props}>
            <AttachMoneyIcon />
        </IconButton>
    )
}
