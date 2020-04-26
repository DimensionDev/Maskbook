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
import type BigNumber from 'bignumber.js'
import { formatBalance } from '../../../plugins/Wallet/formatter'

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: '24px',
            height: '24px',
        },
        name: {
            color: theme.palette.text.primary,
        },
        amount: {
            color: theme.palette.text.primary,
        },
    }),
)

interface TokenListItemProps {
    balance: BigNumber
    token: ERC20TokenRecord
}

export function TokenListItem(props: TokenListItemProps) {
    const classes = useStyles()
    const { balance, token } = props
    const name = token.name?.substr(0, 1).toLocaleUpperCase()
    return (
        <ListItem divider disableGutters>
            <ListItemIcon>
                <Avatar
                    className={classes.coin}
                    src={`https://rawcdn.githack.com/trustwallet/assets/257c82b25e6f27ede7a2b309aadc0ed17bca45ae/blockchains/ethereum/assets/${token.address}/logo.png`}>
                    {name}
                </Avatar>
            </ListItemIcon>
            <ListItemText className={classes.name} primary={token.symbol} secondary={token.name} />
            <ListItemSecondaryAction className={classes.amount}>
                {formatBalance(balance, token.decimals)}
            </ListItemSecondaryAction>
        </ListItem>
    )
}
