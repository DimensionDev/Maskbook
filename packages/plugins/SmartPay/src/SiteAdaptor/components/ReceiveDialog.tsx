import { memo, useState } from 'react'
import { QRCode } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Close } from '@mui/icons-material'
import { alpha, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { PluginSmartPayMessages } from '../../message.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        maxWidth: 420,
        backgroundColor: theme.palette.maskColor.bottom,
        backgroundImage: 'unset',
    },
    title: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    content: {
        padding: theme.spacing(0, 6.25, 3),
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    tips: {
        fontSize: 16,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 28,
    },
    warning: {
        background: alpha(theme.palette.maskColor.danger, 0.1),
        borderRadius: 99,
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.danger,
        padding: theme.spacing(0.5, 1.5),
        marginTop: theme.spacing(2),
    },
}))

export function InjectReceiveDialog() {
    const [address, setAddress] = useState('')
    const [name, setName] = useState('')
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.receiveDialogEvent, (ev) => {
        if (!ev.open) return
        if (ev.address) setAddress(ev.address)
        if (ev.name) setName(ev.name)
    })
    return open ? <ReceiveDialog open onClose={closeDialog} address={address} name={name} /> : null
}

interface Props {
    address: string
    name: string
    open: boolean
    onClose(): void
}
const ReceiveDialog = memo(function ReceiveDialog({ address, name, open, onClose }: Props) {
    const { classes } = useStyles()

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogTitle
                sx={{
                    py: 3,
                    display: 'grid',
                    alignItems: 'center',
                    gridTemplateColumns: '50px auto 50px',
                    whiteSpace: 'nowrap',
                }}>
                <IconButton size="large" disableRipple onClick={onClose} sx={{ padding: 0 }}>
                    <Close color="inherit" style={{ width: 24, height: 24 }} />
                </IconButton>
                <Typography className={classes.title}>{name}</Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
                <QRCode text={`:${address}`} options={{ width: 250 }} canvasProps={{ width: 250, height: 250 }} />
                <Typography className={classes.tips}>
                    <Trans>Scan address to receive payment</Trans>
                </Typography>
                <Typography className={classes.warning}>
                    <Trans>Receives assets on Polygon Network ONLY</Trans>
                </Typography>
            </DialogContent>
        </Dialog>
    ))
})
