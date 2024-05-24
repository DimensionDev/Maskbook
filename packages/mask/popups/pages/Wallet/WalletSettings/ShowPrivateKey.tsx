import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useStyles } from './useStyles.js'
import { ShowPrivateKeyModal } from '../../../modals/modal-controls.js'

export function ShowPrivateKey() {
    const t = useMaskSharedTrans()
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ShowPrivateKeyModal.open({
                    title: t.popups_wallet_settings_enter_payment_password(),
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.PublicKey2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>{t.popups_wallet_settings_backup_wallet()}</Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
