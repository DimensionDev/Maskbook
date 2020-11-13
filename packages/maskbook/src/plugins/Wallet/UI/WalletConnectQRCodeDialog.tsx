import { useCallback, useEffect, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { Button, createStyles, DialogContent, makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { QRCode } from '../../../components/shared/qrcode'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { WalletMessages } from '../messages'
import Services from '../../../extension/service'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontWeight: 700,
            marginLeft: theme.spacing(1),
        },
        tip: {
            fontSize: 14,
            marginBottom: theme.spacing(2),
        },
        copyButton: {
            marginTop: theme.spacing(1),
        },
    }),
)

export interface WalletConnectQRCodeDialogProps extends withClasses<never> {}

export function WalletConnectQRCodeDialog(props: WalletConnectQRCodeDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [URI, setURI] = useState('')

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
        (ev) => ev.open && setURI(ev.uri),
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
        <>
            <InjectedDialog open={open} onClose={onClose} title="WalletConnect">
                <DialogContent className={classes.content}>
                    <Typography className={classes.tip} color="textSecondary">
                        {t('plugin_wallet_qr_code_with_wallet_connect')}
                    </Typography>
                    {URI ? (
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
                    ) : null}
                    <Button className={classes.copyButton} color="primary" variant="text" onClick={onCopy}>
                        {t('copy_to_clipboard')}
                    </Button>
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
