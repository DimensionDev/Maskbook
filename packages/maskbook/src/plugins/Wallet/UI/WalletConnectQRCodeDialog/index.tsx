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
    }),
)

interface Props {
    mode?: 'qrcode' | 'firefox' | 'safari'
}

export const WalletConnectQRCodeDialog: React.FC<Props> = ({ mode }) => {
    const { t } = useI18N()
    const classes = useStyles()
    const [uri, setURI] = useState('asd')
    const [qrMode, setQRMode] = useState(false)

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

    return (
        <InjectedDialog open={open} onClose={onClose} title="Wallet Connect">
            <DialogContent className={classes.container}>
                <PlatformSelector uri={uri} mode={qrMode ? 'qrcode' : mode} />
            </DialogContent>
            <DialogActions className={classes.container}>
                {mode !== 'qrcode' && (
                    <Button variant="contained" onClick={() => setQRMode(!qrMode)}>
                        {t(qrMode ? 'plugin_wallet_return_mobile_wallet_options' : 'plugin_wallet_view_qr_code')}
                    </Button>
                )}
            </DialogActions>
        </InjectedDialog>
    )
}

WalletConnectQRCodeDialog.defaultProps = {
    mode: (() => {
        if (process.env.architecture === 'app' && process.env.target === 'firefox') {
            return 'firefox'
        } else if (process.env.architecture === 'app' && process.env.target === 'safari') {
            return 'safari'
        }
        return 'qrcode'
    })(),
}

export const PlatformSelector: React.FC<{ uri: string; mode: Props['mode'] }> = ({ uri, mode }) => {
    if (!uri) {
        return null
    } else if (mode === 'qrcode') {
        return <QRCodeModel uri={uri} />
    } else if (mode === 'firefox') {
        return <FirefoxPlatform uri={uri} />
    } else if (mode === 'safari') {
        return <SafariPlatform uri={uri} />
    }
    return <QRCodeModel uri={uri} />
}
