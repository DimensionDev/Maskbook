import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon } from '@material-ui/core'
import { TokenIcon } from './TokenIcon'
import type { ERC20Token } from '../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: 28,
            height: 28,
            marginRight: theme.spacing(1),
        },
        text: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        primary: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingRight: theme.spacing(1),
        },
    }),
)

export interface TokenInListProps {
    index: number
    style: any
    data: {
        tokens: ERC20Token[]
        excludeTokens: string[]
        selected: string
        onSelect: (address: string) => void
    }
}

export function TokenInList({ data, index, style }: TokenInListProps) {
    const { address, name, symbol } = data.tokens[index]
    const classes = useStyles()
    return (
        <ListItem
            button
            style={style}
            disabled={data.excludeTokens.includes(address)}
            selected={data.selected === address}
            onClick={() => data.onSelect(address)}>
            <ListItemIcon>
                <TokenIcon classes={{ coin: classes.icon }} address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    {name}
                </Typography>
                <Typography color="textSecondary" component="span">
                    {symbol}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
