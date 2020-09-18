import React from 'react'
import { makeStyles, Theme, createStyles, Chip, Avatar, ChipProps } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { ERC20TokenForUI } from '../types'
import { noop } from 'lodash-es'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        balance: {
            fontSize: 12,
        },
        icon: {
            cursor: 'pointer',
        },
        chip: {
            border: 'none',
            borderRadius: 8,
            paddingLeft: theme.spacing(0.5),
        },
    })
})

export interface SelectTokenChipProps {
    token?: ERC20TokenForUI | null
    readonly?: boolean
    ChipProps?: Partial<ChipProps>
}

export function SelectTokenChip(props: SelectTokenChipProps) {
    const { token, readonly = false, ChipProps } = props
    const classes = useStyles()
    if (!token)
        return (
            <Chip
                className={classes.chip}
                label="Select a token"
                color="default"
                size="small"
                clickable
                {...ChipProps}
            />
        )
    return (
        <Chip
            className={classes.chip}
            icon={
                token.image_url ? (
                    <Avatar src={token.image_url} alt={token.symbol} />
                ) : (
                    <TokenIcon address={token.address} name={token.name} />
                )
            }
            deleteIcon={<ExpandMoreIcon style={{ display: readonly ? 'none' : 'unset' }} />}
            color="default"
            size="small"
            variant="outlined"
            clickable={!readonly}
            label={token.symbol}
            // delete icon visible when this callback provided
            onDelete={noop}
            {...ChipProps}
        />
    )
}
