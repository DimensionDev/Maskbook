import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../../../../shared-ui/index.js'
import { useStyles } from './useStyles.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useContacts, useWallet, useWallets } from '@masknet/web3-hooks-base'

export function Contacts() {
    const t = useMaskSharedTrans()
    const wallet = useWallet()
    const wallets = useWallets()
    const contacts = useContacts()
    const { classes, theme } = useStyles()
    const navigate = useNavigate()
    const totalContacts = wallets.length + contacts.length

    return (
        <ListItem
            className={classes.item}
            onClick={() => navigate(`${PopupRoutes.Contacts}/${wallet?.address}`, { state: { type: 'manage' } })}>
            <Box className={classes.itemBox}>
                <Icons.BaseUser size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t.contacts()}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{totalContacts}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
