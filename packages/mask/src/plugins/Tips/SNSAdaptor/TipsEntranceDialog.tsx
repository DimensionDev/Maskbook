import { useAccount } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { InjectedDialog } from '@masknet/shared'
import {
    BindingProof,
    ECKeyIdentifier,
    NextIDAction,
    NextIDStorageInfo,
    NextIDStoragePayload,
} from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Button, ButtonProps, DialogActions, DialogContent } from '@mui/material'
import { isEqual } from 'lodash-unified'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { getKvPayload, setKvPatchData, useKvGet } from '../hooks/useKv'
import { useProvedWallets } from '../hooks/useProvedWallets'
import { useTipsWalletsList } from '../hooks/useTipsWalletsList'
import { useI18N } from '../locales'
import { getNowTime } from '../utils'
import AddWalletView from './bodyViews/AddWallet'
import SettingView from './bodyViews/Setting'
import WalletsView from './bodyViews/Wallets'
import { EmptyStatus } from './components/EmptyStatus'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { WalletsByNetwork } from './components/WalletsByNetwork'

export interface TipsEntranceDialogProps {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
    walletBtn: {
        fontSize: 14,
    },
    alertBox: {
        marginBottom: '20px',
    },
    actions: {
        position: 'sticky',
        bottom: 0,
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(1.5),
    },
    dialogContent: {
        padding: '12px 16px',
        position: 'relative',
        boxSizing: 'border-box',
    },
    btnContainer: {
        position: 'absolute',
        right: 16,
        maxWidth: '30%',
    },
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
}))

enum Step {
    Main = 'Tips',
    Setting = 'Settings',
    Wallets = 'Wallets',
    AddWallet = 'Add Wallet',
}

interface WalletButtonProps extends ButtonProps {
    step: Step
}

const WalletButton: FC<WalletButtonProps> = ({ step, onClick }) => {
    const { classes } = useStyles()
    if (step === Step.AddWallet) return null
    return (
        <div className={classes.btnContainer}>
            <Button onClick={onClick} className={classes.walletBtn} size="small">
                {step === Step.Wallets ? Step.AddWallet : Step.Wallets}
            </Button>
        </div>
    )
}

export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    const [step, setStep] = useState<Step>(Step.Main)
    const supportedNetworkIds = [NetworkPluginID.PLUGIN_EVM]
    const { showSnackbar } = useCustomSnackbar()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const { value: currentPersonaIdentifier } = useAsyncRetry(() => {
        setShowAlert(true)
        return Services.Settings.getCurrentPersonaIdentifier()
    }, [open])
    const { value: currentPersona } = useAsyncRetry(() => {
        return Services.Identity.queryPersona(currentPersonaIdentifier!)
    }, [currentPersonaIdentifier])
    const clickBack = () => {
        if (step === Step.Main) {
            onClose()
        } else {
            setStep(Step.Main)
        }
    }
    const { value: kv, retry: retryKv } = useKvGet<NextIDStorageInfo<BindingProof[]>>(
        currentPersonaIdentifier?.publicKeyAsHex,
    )
    const { loading, value: proofRes, retry: retryProof } = useProvedWallets()
    const bindingWallets = useTipsWalletsList(
        proofRes,
        currentPersona?.identifier.publicKeyAsHex,
        kv?.ok ? kv.val : undefined,
    )

    const refetch = () => {
        retryProof()
        retryKv()
    }
    const refresh = () => {
        setStep(Step.Main)
        refetch()
    }

    const [pendingDefault, setPendingDefault] = useState<string>()
    const defaultAddress = bindingWallets.find((x) => x.isDefault)?.identity

    const setAsDefault = (addr: string) => {
        setPendingDefault(addr)
    }

    const onSwitchChange = (address: string, checked: boolean) => {
        setPendingPublicAddress((oldList) => {
            const newList = bindingWallets
                .filter((x) => (x.identity === address ? checked : oldList.includes(x.identity)))
                .map((x) => x.identity)
            return newList
        })
    }

    const { setDialog, open: providerDialogOpen } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const onConnectWalletClick = useCallback(() => {
        if (account) {
            setStep(Step.AddWallet)
        } else {
            setDialog({
                open: true,
            })
        }
    }, [account])

    useEffect(() => {
        if (!providerDialogOpen) return
        return WalletMessages.events.walletsUpdated.on(() => {
            setStep(Step.AddWallet)
        })
    }, [providerDialogOpen])
    const [confirmState, onConfirmDelete] = useAsyncFn(
        async (wallet: BindingProof | undefined) => {
            try {
                if (!currentPersona?.identifier.publicKeyAsHex || !wallet) throw new Error('Create Payload Error')

                const result = await NextIDProof.createPersonaPayload(
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.identity,
                    wallet.platform,
                )
                if (!result) throw new Error('Payload Error')

                const signature = await Services.Identity.generateSignResult(
                    currentPersona.identifier,
                    result.signPayload,
                )

                if (!signature) throw new Error('Sign Error')
                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.identifier.publicKeyAsHex,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature: signature.signature.signature },
                )
                showSnackbar(t.tip_persona_sign_success(), {
                    variant: 'success',
                    message: getNowTime(),
                })
            } catch (error) {
                showSnackbar(t.tip_persona_sign_error(), {
                    variant: 'error',
                    message: getNowTime(),
                })
            } finally {
                refetch()
            }
        },
        [currentPersona, proofRes],
    )

    const publicWallets = useMemo(() => bindingWallets.filter((x) => x.isPublic), [bindingWallets])
    const publicAddresses = useMemo(() => {
        return bindingWallets.filter((x) => x.isPublic).map((x) => x.identity)
    }, [bindingWallets])
    const [pendingPublicAddress, setPendingPublicAddress] = useState<string[]>([])
    useEffect(() => {
        setPendingPublicAddress(publicAddresses)
    }, [publicAddresses])

    const isDirty = useMemo(() => {
        if (step === Step.Main) {
            return !!pendingDefault && pendingDefault !== defaultAddress
        } else if (step === Step.Setting) {
            return !isEqual(pendingPublicAddress, publicAddresses)
        }
        return false
    }, [step, pendingDefault, defaultAddress, pendingPublicAddress, publicAddresses])

    const handleReset = () => {
        setPendingDefault(defaultAddress)
        setPendingPublicAddress(publicAddresses)
    }

    const modifiedWallets = useMemo(() => {
        if (!isDirty) return bindingWallets
        return bindingWallets.map((x) => {
            return {
                ...x,
                isDefault: pendingDefault === x.identity ? 1 : 0,
                isPublic: pendingPublicAddress.includes(x.identity) ? 1 : 0,
            } as BindingProof
        })
    }, [isDirty, bindingWallets, pendingDefault, pendingPublicAddress])

    const [kvFetchState, onConfirm] = useAsyncFn(async () => {
        try {
            const payload = await getKvPayload(modifiedWallets)
            if (!payload || !payload.val) throw new Error('Payload Error')
            const signResult = await Services.Identity.generateSignResult(
                currentPersonaIdentifier as ECKeyIdentifier,
                (payload.val as NextIDStoragePayload).signPayload,
            )
            if (!signResult) throw new Error('Sign Error')
            await setKvPatchData(payload.val, signResult.signature.signature, modifiedWallets)
            showSnackbar(t.tip_persona_sign_success(), {
                variant: 'success',
                message: getNowTime(),
            })
            refetch()
            return true
        } catch (error) {
            showSnackbar(t.tip_persona_sign_error(), {
                variant: 'error',
                message: getNowTime(),
            })
            return false
        }
    }, [modifiedWallets, t])

    return (
        <InjectedDialog
            open={open}
            onClose={clickBack}
            isOnBack={step !== Step.Main}
            title={step}
            titleTail={
                <WalletButton
                    className={classes.walletBtn}
                    step={step}
                    onClick={() => {
                        setStep(step === Step.Wallets ? Step.AddWallet : Step.Wallets)
                    }}
                />
            }>
            {loading ? (
                <DialogContent className={classes.dialogContent}>
                    <div className={classes.loading}>
                        <LoadingBase />
                    </div>
                </DialogContent>
            ) : (
                <DialogContent className={classes.dialogContent}>
                    {showAlert && step === Step.Main && (
                        <div className={classes.alertBox}>
                            <VerifyAlertLine onClose={() => setShowAlert(false)} />
                        </div>
                    )}

                    {step === Step.Main && bindingWallets.length > 0 ? (
                        <div>
                            {supportedNetworkIds?.map((x, idx) => {
                                return (
                                    <WalletsByNetwork
                                        wallets={publicWallets}
                                        toSetting={() => setStep(Step.Setting)}
                                        key={idx}
                                        networkId={x}
                                        defaultAddress={pendingDefault}
                                        setAsDefault={setAsDefault}
                                    />
                                )
                            })}
                        </div>
                    ) : step === Step.Main && bindingWallets.length === 0 ? (
                        <EmptyStatus toAdd={onConnectWalletClick} />
                    ) : null}

                    {step === Step.Setting && (
                        <SettingView
                            wallets={bindingWallets}
                            publicAddresses={pendingPublicAddress}
                            onSwitchChange={onSwitchChange}
                        />
                    )}
                    {step === Step.Wallets && (
                        <WalletsView
                            personaName={currentPersona?.nickname}
                            releaseLoading={confirmState.loading}
                            onDelete={onConfirmDelete}
                            defaultAddress={defaultAddress}
                            wallets={bindingWallets}
                        />
                    )}
                    {step === Step.AddWallet && (
                        <AddWalletView onCancel={refresh} bindings={bindingWallets} currentPersona={currentPersona!} />
                    )}
                </DialogContent>
            )}

            {![Step.AddWallet, Step.Wallets].includes(step) && bindingWallets.length > 0 && (
                <DialogActions className={classes.actions}>
                    <ActionButton fullWidth variant="outlined" disabled={!isDirty} onClick={handleReset}>
                        {t.cancel()}
                    </ActionButton>
                    <ActionButton loading={kvFetchState.loading} fullWidth disabled={!isDirty} onClick={onConfirm}>
                        {t.confirm()}
                    </ActionButton>
                </DialogActions>
            )}
        </InjectedDialog>
    )
}
