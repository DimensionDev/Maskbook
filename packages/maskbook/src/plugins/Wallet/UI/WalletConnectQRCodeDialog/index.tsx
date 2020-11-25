import { useCallback, useEffect, useState } from 'react'
import { Button, createStyles, DialogActions, DialogContent, makeStyles } from '@material-ui/core'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../messages'
import Services from '../../../../extension/service'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { SafariPlatform } from './SafariPlatform'
import { FirefoxPlatform } from './FirefoxPlatform'
import { QRCodeModel } from './QRCodeModel'
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles(() =>
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        actions: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '30%',
        },
    }),
)

export const WalletConnectQRCodeDialog: React.FC = () => {
    const [uri, setURI] = useState('')

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
        (ev) => ev.open && setURI(ev.uri),
    )
    const onClose = useCallback(() => setOpen({ open: false }), [setOpen])
    //#endregion

    // connected
    useEffect(() => {
        if (!uri || !open) return
        Services.Ethereum.connectWalletConnect().then(onClose, onClose)
    }, [open, uri, onClose])

    let mode: QRCodeDialogProps['mode'] = 'qrcode'
    if (process.env.architecture === 'app' && process.env.target === 'firefox') {
        mode = 'firefox'
    } else if (process.env.architecture === 'app' && process.env.target === 'safari') {
        mode = 'safari'
    }
    return <QRCodeDialog uri={uri} open={open} mode={mode} onClose={onClose} />
}

interface QRCodeDialogProps {
    uri: string
    open: boolean
    onClose(): void
    mode?: 'qrcode' | 'firefox' | 'safari'
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ uri, open, onClose, mode }) => {
    const { t } = useI18N()
    const classes = useStyles()
    const [qrMode, setQRMode] = useState(false)
    const PlatformSelector: React.FC = () => {
        if (!uri) {
            return null
        } else if (qrMode || mode === 'qrcode') {
            return <QRCodeModel uri={uri} />
        } else if (mode === 'firefox') {
            return <FirefoxPlatform uri={uri} />
        } else if (mode === 'safari') {
            return <SafariPlatform uri={uri} />
        }
        return <QRCodeModel uri={uri} />
    }
    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_connect_dialog_title')}>
            <DialogContent className={classes.container}>
                <PlatformSelector />
            </DialogContent>
            <DialogActions className={classes.actions}>
                {mode !== 'qrcode' && (
                    <Button variant="contained" onClick={() => setQRMode(!qrMode)}>
                        {t(qrMode ? 'plugin_wallet_return_mobile_wallet_options' : 'plugin_wallet_view_qr_code')}
                    </Button>
                )}
            </DialogActions>
        </InjectedDialog>
    )
}
