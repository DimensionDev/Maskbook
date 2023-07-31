import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography, useTheme } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useStyles } from './useStyles.js'
import { ShowPrivateKeyModal } from '../../../modals/modals.js'

export function ShowPrivateKey() {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ShowPrivateKeyModal.openAndWaitForClose({
                    title: t('popups_wallet_settings_show_private_key'),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.PublicKey2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t('popups_wallet_settings_show_private_key')}</Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
