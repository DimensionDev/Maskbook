import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent, Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { useState } from 'react'
import { TipsSupportedChains } from '../constants'
import { WalletsByNetwork } from './components/WalletsByNetwork'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import SettingView from './bodyViews/Setting'
import WalletsView from './bodyViews/Wallets'
import AddWalletView from './bodyViews/AddWallet'
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
        position: 'sticky',
        bottom: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1.5),
    },
    dContent: {
        minHeight: 600,
        position: 'relative',
        boxSizing: 'border-box',
    },
}))

enum BodyViewSteps {
    main = 'Tips',
    setting = 'Settings',
    wallets = 'Wallets',
    addWallet = 'Add wallet',
}
export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    const supportedNetworks = TipsSupportedChains
    const [bodyView, setBodyView] = useState(BodyViewSteps.main)
    const clickBack = () => {
        if (bodyView === BodyViewSteps.main) {
            onClose()
        } else {
            setBodyView(BodyViewSteps.main)
        }
    }
    const WalletButton = () => {
        const { classes } = useStyles()
        return (
            (bodyView !== BodyViewSteps.addWallet && (
                <Button
                    onClick={() => {
                        if (bodyView === BodyViewSteps.wallets) {
                            setBodyView(BodyViewSteps.addWallet)
                        } else {
                            setBodyView(BodyViewSteps.wallets)
                        }
                    }}
                    className={classes.walletBtn}
                    variant="contained"
                    size="small">
                    {bodyView === BodyViewSteps.wallets ? BodyViewSteps.addWallet : BodyViewSteps.wallets}
                </Button>
            )) || <></>
        )
    }
    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                clickBack()
            }}
            title={bodyView}
            badgeAction={WalletButton()}>
            <DialogContent className={classes.dContent}>
                {showAlert && bodyView === BodyViewSteps.main && (
                    <div className={classes.alertBox}>
                        <VerifyAlertLine onClose={() => setShowAlert(false)} />
                    </div>
                )}
                {bodyView === BodyViewSteps.main && (
                    <div>
                        {supportedNetworks.map((x, idx) => {
                            return (
                                <WalletsByNetwork
                                    toSetting={() => setBodyView(BodyViewSteps.setting)}
                                    key={idx}
                                    network={x}
                                />
                            )
                        })}
                    </div>
                )}
                {bodyView === BodyViewSteps.setting && <SettingView />}
                {bodyView === BodyViewSteps.wallets && <WalletsView />}
                {bodyView === BodyViewSteps.addWallet && <AddWalletView />}

                {![BodyViewSteps.addWallet, BodyViewSteps.wallets].includes(bodyView) && (
                    <div className={classes.actions}>
                        <ActionButton fullWidth color="secondary">
                            Cancel
                        </ActionButton>
                        <ActionButton fullWidth>Confirm</ActionButton>
                    </div>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
