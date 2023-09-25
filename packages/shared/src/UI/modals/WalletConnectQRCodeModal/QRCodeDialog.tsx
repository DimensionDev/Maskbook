import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog, useSharedTrans } from '@masknet/shared'
import { QRCodeModal } from './QRCodeModal.js'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
interface QRCodeDialogProps {
    uri: string
    open: boolean
    onClose(): void
}

export function QRCodeDialog({ uri, open, onClose }: QRCodeDialogProps) {
    const t = useSharedTrans()
    const { classes } = useStyles()
    return (
        <InjectedDialog open={open} onClose={onClose} title={t.wallet_connect_qr_code_dialog_title()}>
            <DialogContent className={classes.container}>{uri ? <QRCodeModal uri={uri} /> : null}</DialogContent>
        </InjectedDialog>
    )
}
