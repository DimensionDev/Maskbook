import React from 'react'
import classNames from 'classnames'
import { makeStyles, Theme, createStyles, Chip, Avatar, ChipProps, CircularProgress } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { ERC20TokenForUI } from '../types'
import { noop } from 'lodash-es'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        chip: {
            border: 'none',
            borderRadius: 8,
            paddingLeft: theme.spacing(0.5),
        },
        loadingChip: {
            marginRight: theme.spacing(-0.5),
        },
        icon: {
            pointerEvents: 'none',
        },
    })
})

export interface SelectTokenChipProps {
    token?: ERC20TokenForUI | null
    loading?: boolean
    readonly?: boolean
    ChipProps?: Partial<ChipProps>
}

export function SelectTokenChip(props: SelectTokenChipProps) {
    const { token, loading = false, readonly = false, ChipProps } = props
    const classes = useStyles()

    if (loading)
        return (
            <Chip
                className={classNames(classes.chip, classes.loadingChip)}
                icon={<CircularProgress size={16} />}
                size="small"
                clickable={false}
                variant="outlined"
            />
        )
    if (!token)
        return (
            <Chip className={classes.chip} label="Select a token" size="small" clickable={!readonly} {...ChipProps} />
        )
    return (
        <Chip
            className={classes.chip}
            icon={
                token.logo ? (
                    <Avatar src={token.logo} alt={token.symbol} />
                ) : (
                    <TokenIcon address={token.address} name={token.name} />
                )
            }
            deleteIcon={readonly ? undefined : <ExpandMoreIcon className={classes.icon} />}
            color="default"
            size="small"
            variant="outlined"
            clickable={!readonly}
            label={token.symbol}
            // delete icon visible when this callback provided
            onDelete={readonly ? undefined : noop}
            {...ChipProps}
        />
    )
}
