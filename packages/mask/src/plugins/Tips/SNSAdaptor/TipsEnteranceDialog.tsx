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
import { useProvedWallets } from '../hooks/useProvedWallets'
import { NextIDPersonaBindings, NextIDPlatform } from '@masknet/shared-base'
import Empty from './components/empty'
import { useKvGet } from '../hooks/useKv'
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
        position: 'absolute',
        bottom: 16,
        width: 'calc( 100% - 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1.5),
    },
    dContent: {
        height: 600,
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

    const proofRes = useProvedWallets()
    const walletsList = proofRes.value
        ? (proofRes.value as NextIDPersonaBindings).proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
        : []

    const { value: kv } = useKvGet()
    console.log(kv, 'gggg')

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
        <InjectedDialog open={open} onClose={clickBack} title={bodyView} titleTail={WalletButton()}>
            <DialogContent className={classes.dContent}>
                {showAlert && bodyView === BodyViewSteps.main && (
                    <div className={classes.alertBox}>
                        <VerifyAlertLine onClose={() => setShowAlert(false)} />
                    </div>
                )}

                {bodyView === BodyViewSteps.main && walletsList.length > 0 ? (
                    <div>
                        {supportedNetworks.map((x, idx) => {
                            return (
                                <WalletsByNetwork
                                    wallets={walletsList}
                                    toSetting={() => setBodyView(BodyViewSteps.setting)}
                                    key={idx}
                                    network={x}
                                />
                            )
                        })}
                    </div>
                ) : bodyView === BodyViewSteps.main && walletsList.length === 0 ? (
                    <Empty />
                ) : null}

                {bodyView === BodyViewSteps.setting && <SettingView wallets={walletsList} />}
                {bodyView === BodyViewSteps.wallets && <WalletsView wallets={walletsList} />}
                {bodyView === BodyViewSteps.addWallet && <AddWalletView />}

                {![BodyViewSteps.addWallet, BodyViewSteps.wallets].includes(bodyView) && walletsList.length > 0 && (
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
