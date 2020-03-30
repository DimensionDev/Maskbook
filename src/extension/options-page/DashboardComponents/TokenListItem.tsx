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

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: '24px',
            height: '24px',
        },
    }),
)

export function TokenListItem() {
    const classes = useStyles()
    return (
        <ListItem divider disableGutters>
            <ListItemIcon>
                <Avatar
                    className={classes.coin}
                    src="https://github.com/trustwallet/assets/raw/master/blockchains/ethereum/assets/0x00000100F2A2bd000715001920eB70D229700085/logo.png"></Avatar>
            </ListItemIcon>
            <ListItemText primary={'DAI'} secondary={'Dai Stablecoin'} />
            <ListItemSecondaryAction>0.124645998323285029</ListItemSecondaryAction>
        </ListItem>
    )
}
