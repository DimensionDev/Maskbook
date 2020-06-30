import React from 'react'
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    makeStyles,
    createStyles,
} from '@material-ui/core'
import type BigNumber from 'bignumber.js'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { TokenIcon } from './TokenIcon'
import type { ERC20TokenDetails } from '../../background-script/PluginService'

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: 24,
            height: 24,
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
    token: ERC20TokenDetails
}

export function TokenListItem(props: TokenListItemProps) {
    const classes = useStyles()
    const { balance, token } = props
    return (
        <ListItem divider disableGutters>
            <ListItemIcon>
                <TokenIcon
                    classes={{ coin: classes.coin }}
                    name={token.name?.substr(0, 1).toLocaleUpperCase()}
                    address={token.address}></TokenIcon>
            </ListItemIcon>
            <ListItemText className={classes.name} primary={token.symbol} secondary={token.name} />
            <ListItemSecondaryAction className={classes.amount}>
                {formatBalance(balance, token.decimals)}
            </ListItemSecondaryAction>
        </ListItem>
    )
}
