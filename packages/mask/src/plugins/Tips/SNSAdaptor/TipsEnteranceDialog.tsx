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
import { BindingProof, NextIDPersonaBindings, NextIDPlatform } from '@masknet/shared-base'
import Empty from './components/empty'
import { useKvGet } from '../hooks/useKv'
import { InjectedDialog } from '@masknet/shared'
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
    btnContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row-reverse',
    },
}))

enum BodyViewSteps {
    main = 'Tips',
    setting = 'Settings',
    wallets = 'Wallets',
    addWallet = 'Add wallet',
}
export interface WalletProof extends BindingProof {
    isDefault: number
    isPublic: number
}
export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    const supportedNetworks = TipsSupportedChains
    const [bodyView, setBodyView] = useState(BodyViewSteps.main)
    const [hasChanged, setHasChanged] = useState(false)
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

    const resolveWallets = () => {
        if (!kv) {
            ;(walletsList as WalletProof[]).forEach((x, idx) => {
                x.isPublic = 1
                x.isDefault = 0
                if (idx === 0) {
                    x.isDefault = 1
                    return
                }
            })
            return walletsList as WalletProof[]
        }

        return []
    }

    const WalletButton = () => {
        const { classes } = useStyles()
        return (
            (bodyView !== BodyViewSteps.addWallet && (
                <div className={classes.btnContainer}>
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
                </div>
            )) ||
            null
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

                {bodyView === BodyViewSteps.main && resolveWallets().length > 0 ? (
                    <div>
                        {supportedNetworks.map((x, idx) => {
                            return (
                                <WalletsByNetwork
                                    wallets={resolveWallets()}
                                    toSetting={() => setBodyView(BodyViewSteps.setting)}
                                    key={idx}
                                    network={x}
                                />
                            )
                        })}
                    </div>
                ) : bodyView === BodyViewSteps.main && resolveWallets().length === 0 ? (
                    <Empty />
                ) : null}

                {bodyView === BodyViewSteps.setting && <SettingView wallets={resolveWallets()} />}
                {bodyView === BodyViewSteps.wallets && <WalletsView wallets={resolveWallets()} />}
                {bodyView === BodyViewSteps.addWallet && <AddWalletView />}

                {![BodyViewSteps.addWallet, BodyViewSteps.wallets].includes(bodyView) && resolveWallets().length > 0 && (
                    <div className={classes.actions}>
                        <ActionButton fullWidth color="secondary">
                            Cancel
                        </ActionButton>
                        <ActionButton fullWidth disabled={!hasChanged}>
                            Confirm
                        </ActionButton>
                    </div>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
