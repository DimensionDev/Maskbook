import React, { useCallback, useEffect, useState } from 'react'
import { createStyles, DialogContent, makeStyles, Typography, useTheme } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { QRCode } from '../../../components/shared/qrcode'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../messages'
import Services from '../../../extension/service'

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            width: 448,
        },
        content: {
            paddingTop: theme.spacing(3),
            paddingBottom: theme.spacing(3),
            textAlign: 'center',
        },
        tip: {
            fontSize: 14,
            marginBottom: theme.spacing(2),
        },
    }),
)

export interface WalletConnectQRCodeDialogProps
    extends withClasses<
        KeysInferFromUseStyles<typeof useStyles> | 'root' | 'dialog' | 'backdrop' | 'container' | 'paper' | 'content'
    > {}

export function WalletConnectQRCodeDialog(props: WalletConnectQRCodeDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [URI, setURI] = useState('')
    const theme = useTheme()

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'walletConnectQRCodeDialogUpdated'>(
        WalletMessageCenter,
        'walletConnectQRCodeDialogUpdated',
        (ev) => {
            if (ev.open) setURI(ev.uri)
        },
    )
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    // connected
    useEffect(() => {
        if (!URI) return
        if (!open) return
        Services.Ethereum.connectWalletConnect().then(onClose)
    }, [open, URI, onClose])

    console.log('DEBUG: wallet connect')
    console.log({
        width: 400,
        color: {
            dark: `${theme.palette.text.primary}ff`,
            light: `${theme.palette.background.paper}ff`,
        },
    })

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{ container: classes.container, paper: classes.paper }}
                open={open}
                scroll="body"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onEscapeKeyDown={onClose}
                onBackdropClick={onClose}
                BackdropProps={{
                    className: classes.backdrop,
                }}>
                <DialogContent className={classes.content}>
                    <Typography className={classes.tip} color="textSecondary">
                        Scan QR code with a WalletConnect-compatible wallet.
                    </Typography>
                    <QRCode
                        text={URI}
                        options={{
                            width: 400,
                        }}
                        canvasProps={{
                            style: {
                                width: 400,
                                height: 400,
                                display: 'block',
                                margin: 'auto',
                            },
                        }}
                    />
                </DialogContent>
            </ShadowRootDialog>
        </div>
    )
}
