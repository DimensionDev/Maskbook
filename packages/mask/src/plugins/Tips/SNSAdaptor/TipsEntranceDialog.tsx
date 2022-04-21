import { DialogContent, Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { useCallback, useEffect, useState } from 'react'
import { TipsSupportedChains } from '../constants'
import { WalletsByNetwork } from './components/WalletsByNetwork'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import SettingView from './bodyViews/Setting'
import WalletsView from './bodyViews/Wallets'
import AddWalletView from './bodyViews/AddWallet'
import { useProvedWallets } from '../hooks/useProvedWallets'
import {
    BindingProof,
    ECKeyIdentifier,
    NextIDAction,
    NextIDPersonaBindings,
    NextIDPlatform,
    NextIdStorageInfo,
    NextIDStoragePayload,
} from '@masknet/shared-base'
import Empty from './components/empty'
import { getKvPayload, kvSet, useKvGet } from '../hooks/useKv'
import { InjectedDialog, LoadingAnimation } from '@masknet/shared'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { PluginId } from '@masknet/plugin-infra'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, useAccount } from '@masknet/web3-shared-evm'
import formatDateTime from 'date-fns/format'
import { LoadingButton } from '@mui/lab'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { cloneDeep } from 'lodash-unified'
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
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
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
    const [bodyView, setBodyView] = useState<BodyViewSteps>(BodyViewSteps.main)
    const [hasChanged, setHasChanged] = useState(false)
    const [rawPatchData, setRawPatchData] = useState<BindingProof[]>([])
    const [rawWalletList, setRawWalletList] = useState<BindingProof[]>([])
    const { showSnackbar } = useCustomSnackbar()
    const account = useAccount()
    const nowTime = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')

    const { value: currentPersonaIdentifier } = useAsyncRetry(
        () => Services.Settings.getCurrentPersonaIdentifier(),
        [open],
    )
    const { value: currentPersona } = useAsyncRetry(
        () => Services.Identity.queryPersona(currentPersonaIdentifier as ECKeyIdentifier),
        [currentPersonaIdentifier],
    )
    const clickBack = () => {
        if (bodyView === BodyViewSteps.main) {
            onClose()
        } else {
            setBodyView(BodyViewSteps.main)
        }
    }
    const { value: kv, retry: retryKv } = useKvGet()
    const { loading, value: proofRes, retry: retryProof } = useProvedWallets()
    useEffect(() => {
        setShowAlert(true)
    }, [open])
    useEffect(() => {
        setHasChanged(false)
        const walletsList = proofRes
            ? (proofRes as NextIDPersonaBindings).proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
            : []
        walletsList.sort((a, b) => Number.parseInt(b.last_checked_at, 10) - Number.parseInt(a.last_checked_at, 10))
        walletsList.reverse().forEach((i: BindingProof, idx: number) => (i.rawIdx = idx))
        walletsList.reverse()
        if (kv?.ok && kv.val.proofs.length > 0 && walletsList.length > 0) {
            const kvCache = (kv.val as NextIdStorageInfo).proofs.find(
                (x) => x.identity === currentPersona?.publicHexKey,
            )
            if (!kvCache) return
            const result: BindingProof[] = walletsList.reduce<BindingProof[]>((res, x) => {
                x.isDefault = 0
                x.isPublic = 1
                const temp = (kvCache?.content[PluginId.Tip] as BindingProof[]).filter((i) =>
                    isSameAddress(x.identity, i.identity),
                )
                if (temp && temp.length > 0) {
                    x.isDefault = temp[0].isDefault
                    x.isPublic = temp[0].isPublic
                }
                res.push(x)
                return res
            }, [])
            const idx = result.findIndex((i) => i.isDefault)
            if (idx !== -1) {
                result.unshift(result.splice(idx, 1)[0])
            } else {
                result[0].isDefault = 1
            }

            setRawWalletList(result)
            setRawPatchData(result)
            return
        }
        walletsList.forEach((x, idx) => {
            x.isPublic = 1
            x.isDefault = 0
            if (idx === 0) {
                x.isDefault = 1
                return
            }
        })
        setRawWalletList(cloneDeep(walletsList))
        setRawPatchData(cloneDeep(walletsList))
    }, [proofRes, kv, bodyView])

    const onCancel = () => {
        setRawPatchData(cloneDeep(rawWalletList))
        setHasChanged(false)
    }

    const refresh = () => {
        setBodyView(BodyViewSteps.main)
        retryProof()
        retryKv()
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
    const setAsDefault = (idx: number) => {
        const changed = cloneDeep(rawPatchData)
        changed.forEach((x: any) => (x.isDefault = 0))
        changed[idx].isDefault = 1
        const defaultItem = changed[idx]
        changed.splice(idx, 1)
        changed.sort(
            (a: BindingProof, b: BindingProof) =>
                Number.parseInt(b.last_checked_at, 10) - Number.parseInt(a.last_checked_at, 10),
        )
        changed.unshift(defaultItem)
        setRawPatchData(changed)
        setHasChanged(true)
    }

    const onSwitchChange = (idx: number, v: boolean) => {
        const changed = cloneDeep(rawPatchData)
        changed[idx].isPublic = v ? 1 : 0
        setRawPatchData(changed)
        setHasChanged(true)
    }

    const [kvFetchState, onConfirm] = useAsyncFn(async () => {
        try {
            const payload = await getKvPayload(rawPatchData)
            if (!payload || !payload.val) throw new Error('payload error')
            const signResult = await Services.Identity.generateSignResult(
                currentPersonaIdentifier as ECKeyIdentifier,
                (payload.val as NextIDStoragePayload).signPayload,
            )
            if (!signResult) throw new Error('sign error')
            await kvSet(payload.val, signResult.signature.signature, rawPatchData)
            showSnackbar('Persona signed successfully.', {
                variant: 'success',
                message: nowTime,
            })
            retryProof()
            retryKv()
            return true
        } catch (error) {
            showSnackbar('Persona Signature failed.', {
                variant: 'error',
                message: nowTime,
            })
            console.error(error)
            return false
        }
    }, [hasChanged, rawPatchData])
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnectWalletClick = useCallback(() => {
        if (account) {
            setBodyView(BodyViewSteps.addWallet)
        } else {
            setDialog({
                open: true,
                onlyEvm: true,
            })
            WalletMessages.events.walletsUpdated.on(() => {
                setBodyView(BodyViewSteps.addWallet)
            })
        }
    }, [account])
    const [confirmState, onConfirmRelease] = useAsyncFn(
        async (wallet) => {
            try {
                if (!currentPersona?.publicHexKey || !wallet) throw new Error('failed')

                const result = await NextIDProof.createPersonaPayload(
                    currentPersona.publicHexKey,
                    NextIDAction.Delete,
                    wallet.identity,
                    wallet.platform,
                )
                if (!result) throw new Error('payload error')

                const signature = await Services.Identity.generateSignResult(
                    currentPersona.identifier,
                    result.signPayload,
                )

                if (!signature) throw new Error('sign error')
                await NextIDProof.bindProof(
                    result.uuid,
                    currentPersona.publicHexKey,
                    NextIDAction.Delete,
                    wallet.platform,
                    wallet.identity,
                    result.createdAt,
                    { signature: signature.signature.signature },
                )
                retryProof()
                retryKv()
                return true
            } catch (error) {
                showSnackbar('Persona Signature failed.', {
                    variant: 'error',
                    message: nowTime,
                })
                return false
            }
        },
        [currentPersona],
    )

    return (
        <InjectedDialog open={open} onClose={clickBack} title={bodyView} titleTail={WalletButton()}>
            {loading ? (
                <DialogContent className={classes.dContent}>
                    <div className={classes.loading}>
                        <LoadingAnimation />
                    </div>
                </DialogContent>
            ) : (
                <DialogContent className={classes.dContent}>
                    {showAlert && bodyView === BodyViewSteps.main && (
                        <div className={classes.alertBox}>
                            <VerifyAlertLine onClose={() => setShowAlert(false)} />
                        </div>
                    )}

                    {bodyView === BodyViewSteps.main && rawPatchData.length > 0 ? (
                        <div>
                            {supportedNetworks.map((x, idx) => {
                                return (
                                    <WalletsByNetwork
                                        wallets={rawPatchData}
                                        toSetting={() => setBodyView(BodyViewSteps.setting)}
                                        key={idx}
                                        network={x}
                                        setAsDefault={setAsDefault}
                                    />
                                )
                            })}
                        </div>
                    ) : bodyView === BodyViewSteps.main && rawPatchData.length === 0 ? (
                        <Empty toAdd={onConnectWalletClick} />
                    ) : null}

                    {bodyView === BodyViewSteps.setting && (
                        <SettingView onSwitchChange={onSwitchChange} wallets={rawPatchData} />
                    )}
                    {bodyView === BodyViewSteps.wallets && (
                        <WalletsView
                            personaName={currentPersona?.nickname}
                            releaseLoading={confirmState.loading}
                            onRelease={(wallet) => onConfirmRelease(wallet)}
                            wallets={rawPatchData}
                        />
                    )}
                    {bodyView === BodyViewSteps.addWallet && (
                        <AddWalletView onCancel={refresh} bounds={rawWalletList} currentPersona={currentPersona} />
                    )}

                    {![BodyViewSteps.addWallet, BodyViewSteps.wallets].includes(bodyView) && rawPatchData.length > 0 && (
                        <div className={classes.actions}>
                            <ActionButton
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                disabled={!hasChanged}
                                onClick={onCancel}>
                                {t('cancel')}
                            </ActionButton>
                            <LoadingButton
                                color="primary"
                                variant="contained"
                                size="large"
                                loading={kvFetchState.loading}
                                fullWidth
                                disabled={!hasChanged}
                                onClick={onConfirm}>
                                {t('confirm')}
                            </LoadingButton>
                        </div>
                    )}
                </DialogContent>
            )}
        </InjectedDialog>
    )
}
