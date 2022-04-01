import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent, Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { useState } from 'react'
import { TipsSupportedChains } from '../constants'
import { WalletsByNetwork } from './components/WalletsByNetwork'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
export interface TipsEntranceDialogProps {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    walletBtn: {
        fontSize: '14px',
    },
    alertBox: {
        marginBottom: '20px',
    },
    actions: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1.5),
    },
}))

const WalletButton = () => {
    const { classes } = useStyles()
    return (
        <Button className={classes.walletBtn} variant="contained" size="small">
            Wallets
        </Button>
    )
}
export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    const supportedNetworks = TipsSupportedChains
    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                onClose()
            }}
            title={t('plugin_tips_name')}
            badgeAction={WalletButton()}>
            <DialogContent>
                {showAlert && (
                    <div className={classes.alertBox}>
                        <VerifyAlertLine onClose={() => setShowAlert(false)} />
                    </div>
                )}
                {supportedNetworks.map((x, idx) => {
                    return <WalletsByNetwork key={idx} network={x} />
                })}
                <div className={classes.actions}>
                    <ActionButton fullWidth color="secondary">
                        Cancel
                    </ActionButton>
                    <ActionButton fullWidth>Confirm</ActionButton>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
