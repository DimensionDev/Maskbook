import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Box, ListItem, Typography } from '@mui/material'
import { ShowPrivateKeyModal } from '../../../modals/modal-controls.js'
import { useStyles } from './useStyles.js'

interface Props {
    disabled?: boolean
}
export const ShowPrivateKey = function ShowPrivateKey({ disabled }: Props) {
    const { classes, theme } = useStyles()

    return (
        <ListItem
            className={classes.item}
            sx={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => {
                if (disabled) return
                ShowPrivateKeyModal.open({
                    title: <Trans>Enter Payment Password</Trans>,
                })
            }}>
            <Box className={classes.itemBox}>
                <Icons.PublicKey2 size={20} color={theme.vars.palette.maskColor.second} />
                <Typography className={classes.itemText}>
                    <Trans>Backup Wallet</Trans>
                </Typography>
            </Box>
            <Icons.ArrowRight color={theme.vars.palette.maskColor.second} size={24} />
        </ListItem>
    )
}
