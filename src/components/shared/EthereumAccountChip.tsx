import React from 'react'
import { Chip, ChipProps, makeStyles, Theme, createStyles } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            borderRadius: 12,
            lineHeight: 1,
        },
        balance: {
            fontSize: 12,
            marginRight: theme.spacing(1),
        },
    })
})

export interface EthereumAccountChipProps {
    address?: string
    ChipProps?: Partial<ChipProps>
}

export function EthereumAccountChip({ address = '', ChipProps }: EthereumAccountChipProps) {
    const classes = useStyles()
    const address_ = address.replace(/^0x/i, '')
    if (!address_) return null
    return <Chip className={classes.root} size="medium" label={`0x${address_.slice(0, 4)}...${address_.slice(-4)}`} />
}
