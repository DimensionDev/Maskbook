import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useStyles } from './useStyles.js'
import { ShowPrivateKeyModal } from '../../../modals/modal-controls.js'
import { Trans } from '@lingui/macro'

export function ShowPrivateKey() {
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ShowPrivateKeyModal.open({
                    title: <Trans>Enter Payment Password</Trans>,
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.PublicKey2 size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Backup Wallet</Trans>
                </Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
