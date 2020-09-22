import React from 'react'
import { Chip, ChipProps, makeStyles, Theme, createStyles } from '@material-ui/core'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            lineHeight: 1,
        },
    })
})

export interface EthereumAccountChipProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    address?: string
    ChipProps?: Partial<ChipProps>
}

export function EthereumAccountChip(props: EthereumAccountChipProps) {
    const { address = '', ChipProps } = props
    const classes = useStylesExtends(useStyles(), props)

    const address_ = address.replace(/^0x/i, '')
    if (!address_) return null
    return (
        <Chip
            className={classes.root}
            size="small"
            label={`0x${address_.slice(0, 4)}...${address_.slice(-4)}`}
            {...ChipProps}
        />
    )
}
