import React, { useCallback, useEffect, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { Box, Button, createStyles, DialogContent, DialogTitle, makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { QRCode } from '../../../components/shared/qrcode'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { MaskbookWalletMessages, WalletMessageCenter } from '../messages'
import Services from '../../../extension/service'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import { map } from 'lodash-es'

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            width: 448,
        },
        header: {
            padding: theme.spacing(2, 2, 0, 2),
        },
        content: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
            textAlign: 'center',
        },
        logo: {},
        title: {
            fontWeight: 700,
            marginLeft: theme.spacing(1),
        },
        tip: {
            fontSize: 14,
            marginBottom: theme.spacing(2),
        },
        copyButton: {
            color: theme.palette.text.secondary,
            marginTop: theme.spacing(1),
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

    //#region copy to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(async () => {
        if (!URI) return
        copyToClipboard(URI)
    }, [URI])
    //#endregion

    // connected
    useEffect(() => {
        if (!URI) return
        if (!open) return
        Services.Ethereum.connectWalletConnect().then(onClose).catch(onClose)
    }, [open, URI, onClose])

    return (
        <div className={classes.root}>
            <ShadowRootDialog
                className={classes.dialog}
                classes={{
                    container: classes.container,
                    paper: classes.paper,
                }}
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
                <DialogTitle className={classes.header}>
                    <Box display="flex" alignItems="center">
                        <WalletConnectIcon className={classes.logo} />
                        <Typography className={classes.title}>WalletConnect</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent className={classes.content}>
                    <Typography className={classes.tip} color="textSecondary">
                        Scan QR code with a WalletConnect-compatible wallet.
                    </Typography>
                    <Platform uri={URI} />
                    <Button className={classes.copyButton} color="secondary" variant="text" onClick={onCopy}>
                        Copy to clipboard
                    </Button>
                </DialogContent>
            </ShadowRootDialog>
        </div>
    )
}

const Platform: React.FC<{ uri: string }> = ({ uri }) => {
    if (uri === '') {
        return null
    } else if (process.env.architecture === 'app' && process.env.target === 'firefox') {
        // Android only
        const onConnect = () => {
            open(uri)
        }
        return <button onClick={onConnect}>Connect</button>
    } else if (process.env.architecture === 'app' && process.env.target === 'safari') {
        // iOS only
        const universalLinks = {
            Rainbow: 'https://rnbwapp.com/wc',
            MetaMask: 'https://metamask.app.link/wc',
            Trust: 'https://link.trustwallet.com/wc',
            imToken: 'imtokenv2://wc',
        }
        const makeConnect = (link: string) => () => {
            const url = new URL(link)
            url.searchParams.set('uri', uri)
            open(url.toString())
        }
        return (
            <>
                {map(universalLinks, (link, name) => (
                    <button onClick={makeConnect(link)}>Connect to {name}</button>
                ))}
            </>
        )
    }
    const style = { width: 400, height: 400, display: 'block', margin: 'auto' }
    return <QRCode text={uri} options={{ width: 400 }} canvasProps={{ style }} />
}
