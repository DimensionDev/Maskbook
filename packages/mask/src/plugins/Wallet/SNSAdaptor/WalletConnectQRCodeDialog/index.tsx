import { useState } from 'react'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useI18N } from '../../../../utils/index.js'
import { QRCodeModal } from './QRCodeModal.js'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
export const WalletConnectQRCodeDialog: React.FC = () => {
    const [uri, setURI] = useState('')

    const { open, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
        (ev) => ev.open && setURI(ev.uri),
    )

    return open ? <QRCodeDialog uri={uri} open onClose={closeDialog} /> : null
}

export interface QRCodeDialogProps {
    uri: string
    open: boolean
    onClose(): void
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ uri, open, onClose }) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_connect_dialog_title')}>
            <DialogContent className={classes.container}>{uri ? <QRCodeModal uri={uri} /> : null}</DialogContent>
        </InjectedDialog>
    )
}
