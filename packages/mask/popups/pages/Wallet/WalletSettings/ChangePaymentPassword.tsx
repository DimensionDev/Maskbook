import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { useStyles } from './useStyles.js'
import { ChangePaymentPasswordModal } from '../../../modals/modal-controls.js'
import { Trans } from '@lingui/macro'

export function ChangePaymentPassword() {
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            onClick={() =>
                ChangePaymentPasswordModal.open({
                    title: <Trans>Change Payment Password</Trans>,
                })
            }>
            <Box className={classes.itemBox}>
                <Icons.Lock size={20} color={theme.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Change Payment Password</Trans>
                </Typography>
            </Box>
            <Icons.ArrowRight color={theme.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
