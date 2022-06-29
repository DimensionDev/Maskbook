import { useState } from 'react'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { SafariPlatform } from './SafariPlatform'
import { FirefoxPlatform } from './FirefoxPlatform'
import { QRCodeModal } from './QRCodeModal'

const useStyles = makeStyles()({
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
})
export const WalletConnectQRCodeDialog: React.FC = () => {
    const [uri, setURI] = useState('')

    const { open, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
        (ev) => ev.open && setURI(ev.uri),
    )

    let mode: QRCodeDialogProps['mode'] = 'qrcode'
    if (process.env.architecture === 'app' && process.env.engine === 'firefox') {
        mode = 'firefox'
    } else if (process.env.architecture === 'app' && process.env.engine === 'safari') {
        mode = 'safari'
    }
    return (
        <QRCodeDialog
            uri={uri}
            open={open}
            mode={mode}
            onClose={async () => {
                closeDialog()
            }}
        />
    )
}

export interface QRCodeDialogProps {
    uri: string
    open: boolean
    onClose(): void
    mode?: 'qrcode' | 'firefox' | 'safari'
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ uri, open, onClose, mode }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [qrMode, setQRMode] = useState(false)
    const PlatformSelector: React.FC = () => {
        if (!uri) {
            return null
        } else if (qrMode || mode === 'qrcode') {
            return <QRCodeModal uri={uri} />
        } else if (mode === 'firefox') {
            return <FirefoxPlatform uri={uri} />
        } else if (mode === 'safari') {
            return <SafariPlatform uri={uri} />
        }
        return <QRCodeModal uri={uri} />
    }
    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_connect_dialog_title')}>
            <DialogContent className={classes.container}>
                <PlatformSelector />
            </DialogContent>
            {mode !== 'qrcode' && (
                <DialogActions className={classes.actions}>
                    <Button onClick={() => setQRMode(!qrMode)}>
                        {t(qrMode ? 'plugin_wallet_return_mobile_wallet_options' : 'plugin_wallet_view_qr_code')}
                    </Button>
                </DialogActions>
            )}
        </InjectedDialog>
    )
}
