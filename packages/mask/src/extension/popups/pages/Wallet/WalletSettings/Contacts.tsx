import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useContacts, useWallet, useWallets } from '@masknet/web3-hooks-base'

export function Contacts() {
    const { t } = useI18N()
    const theme = useTheme()
    const wallet = useWallet()
    const wallets = useWallets()
    const contacts = useContacts()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const totalContacts = wallets.length + contacts.length

    return (
        <ListItem
            className={classes.item}
            onClick={() => navigate(`${PopupRoutes.Contacts}/${wallet?.address}`, { state: { type: 'manage' } })}>
            <Box className={classes.itemBox}>
                <Icons.BaseUser size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('contacts')}</Typography>
            </Box>
            <Box className={classes.itemBox}>
                <Typography className={classes.itemText}>{totalContacts}</Typography>
                <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
            </Box>
        </ListItem>
    )
}
