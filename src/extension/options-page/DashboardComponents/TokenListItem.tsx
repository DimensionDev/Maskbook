import React from 'react'
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    makeStyles,
    createStyles,
    Avatar,
} from '@material-ui/core'
import type { ERC20TokenRecord } from '../../../plugins/Wallet/database/types'

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: '24px',
            height: '24px',
        },
    }),
)

interface TokenListItemProps {
    token: ERC20TokenRecord
}

export function TokenListItem(props: TokenListItemProps) {
    const classes = useStyles()
    const { token } = props
    return (
        <ListItem divider disableGutters>
            <ListItemIcon>
                <Avatar
                    className={classes.coin}
                    src={`https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/assets/${token.address}/logo.png`}></Avatar>
            </ListItemIcon>
            <ListItemText primary={token.symbol} secondary={token.name} />
            <ListItemSecondaryAction>{token.decimals}</ListItemSecondaryAction>
        </ListItem>
    )
}
