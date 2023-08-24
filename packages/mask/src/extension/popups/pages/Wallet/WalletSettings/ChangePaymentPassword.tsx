import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { ChangePaymentPasswordModal } from '../../../modals/modals.js'

export function ChangePaymentPassword() {
    const { t } = useI18N()
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ChangePaymentPasswordModal.open({
                    title: t('popups_wallet_settings_change_payment_password'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Lock size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    {t('popups_wallet_settings_change_payment_password')}
                </Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
