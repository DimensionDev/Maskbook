import { Icons } from '@masknet/icons'
import { useWallet } from '@masknet/web3-hooks-base'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { WalletAutoLockSettingModal } from '../../../modals/modals.js'

export function AutoLock() {
    const { t } = useI18N()
    const wallet = useWallet()
    const theme = useTheme()
    const { classes } = useStyles()

    if (!wallet) return null

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                WalletAutoLockSettingModal.openAndWaitForClose({
                    title: t('popups_wallet_settings_auto_unlock_time_title'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Time size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_settings_auto_unlock_time')}</Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
