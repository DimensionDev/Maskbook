import { useCallback, useEffect, useState } from 'react'
import { DialogContent } from '@material-ui/core'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../messages'
import Services from '../../../../extension/service'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { FirefoxPlatform } from './FirefoxPlatform'
import { SafariPlatform } from './SafariPlatform'
import { QRCodeModel } from './QRCodeModel'

export function WalletConnectQRCodeDialog() {
    const [uri, setURI] = useState('')

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
        (ev) => ev.open && setURI(ev.uri),
    )
    const onClose = useCallback(() => setOpen({ open: false }), [setOpen])
    //#endregion

    const onReject = useCallback(() => {
        if (process.env.architecture === 'web') {
            onClose()
        } else {
            // notify
        }
    }, [onClose])

    // connected
    useEffect(() => {
        if (!uri || !open) return
        Services.Ethereum.connectWalletConnect().then(onClose, onReject)
    }, [open, uri, onClose, onReject])

    return (
        <>
            <InjectedDialog open={open} onExit={onClose} title="WalletConnect">
                <DialogContent>
                    <PlatformSelector uri={uri} />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}

export const PlatformSelector: React.FC<{ uri: string }> = ({ uri }) => {
    if (!uri) {
        return null
    } else if (process.env.architecture === 'app' && process.env.target === 'firefox') {
        return <FirefoxPlatform uri={uri} />
    } else if (process.env.architecture === 'app' && process.env.target === 'safari') {
        return <SafariPlatform uri={uri} />
    } else {
        return <QRCodeModel uri={uri} />
    }
}
