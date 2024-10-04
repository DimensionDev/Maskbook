import { memo } from 'react'
import { Box, DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { PluginSmartPayMessages } from '../../message.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
        minHeight: 564,
        boxSizing: 'border-box',
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
    },
    content: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
    strong: {
        color: theme.palette.maskColor.main,
    },
}))

export function InjectSmartPayDescriptionDialog() {
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDescriptionDialogEvent)
    return open ? <SmartPayDescriptionDialog open onClose={closeDialog} /> : null
}

interface Props {
    open: boolean
    onClose(): void
}
const SmartPayDescriptionDialog = memo(function SmartPayDescriptionDialog({ open, onClose }: Props) {
    const { classes } = useStyles()
    return (
        <InjectedDialog open={open} onClose={onClose} title={<Trans>What is SmartPay</Trans>}>
            <DialogContent className={classes.dialogContent}>
                <Typography className={classes.title}>
                    <Trans>What is SmartPay?</Trans>
                </Typography>
                <Typography sx={{ my: 3 }} className={classes.content}>
                    <Trans>
                        SmartPay is based on ERC-4337 and is currently deployed on Polygon Network. Multiple chains will
                        be supported in the future. ERC-4337 is a new wallet proposal that would open the door for
                        creativity in wallet design and could provide more important features. And we will design more
                        fascinating features based on the new wallet proposal in Mask Network.
                    </Trans>
                </Typography>
                <Typography className={classes.title}>
                    <Trans>You need to know before using SmartPay:</Trans>
                </Typography>
                <Box component="ul">
                    <Typography component="li" className={classes.content}>
                        <Trans>
                            <strong className={classes.strong}>
                                Your smart contract wallet is only deployed on Polygon Network for now. Please do not
                                receive funds on other chains with the same address.
                            </strong>{' '}
                            We will support more chains in the future.
                        </Trans>
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        <Trans>Free gas experience in Mask Network’s dApps like Lucky Drop and Tips.</Trans>
                    </Typography>
                </Box>
                <Typography className={classes.title}>
                    <Trans>
                        The ERC-4337 will open the door to more creativity and more important features for wallet
                        design.
                    </Trans>
                </Typography>
                <Box component="ul">
                    <Typography component="li" className={classes.content}>
                        <Trans>Multisigs and social recovery</Trans>
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        <Trans>More efficient and simpler signature algorithms (eg. Schnorr, BLS)</Trans>
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        <Trans>Post-quantum safe signature algorithms (eg. Lamport, Winternitz)</Trans>
                    </Typography>
                    <Typography component="li" className={classes.content}>
                        <Trans>Upgradeability</Trans>
                    </Typography>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
})
