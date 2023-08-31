import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { ShowPrivateKeyModal } from '../../../modals/modals.js'

export function ShowPrivateKey() {
    const { t } = useI18N()
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ShowPrivateKeyModal.open({
                    title: t('popups_wallet_settings_enter_payment_password'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.PublicKey2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_settings_backup_wallet')}</Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
