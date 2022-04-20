import { DialogContent, Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { useEffect, useState } from 'react'
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
import { isSameAddress } from '@masknet/web3-shared-evm'
import formatDateTime from 'date-fns/format'
import { LoadingButton } from '@mui/lab'
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
    cancelBtn: {
        border: '1px solid rgba(47, 51, 54, 1)',
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
    const [bodyView, setBodyView] = useState<BodyViewSteps>(BodyViewSteps.main)
    const [hasChanged, setHasChanged] = useState(false)
    const [rawPatchData, setRawPatchData] = useState<WalletProof[]>([])
    const [rawWalletList, setRawWalletList] = useState<WalletProof[]>([])
    const { showSnackbar } = useCustomSnackbar()
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
        walletsList.sort((a, b) => Number.parseInt(a.created_at, 10) - Number.parseInt(b.created_at, 10))
        if (kv !== undefined && (kv?.val as NextIdStorageInfo).proofs.length > 0 && walletsList.length > 0) {
            const kvCache = (kv.val as NextIdStorageInfo).proofs.find(
                (x) => x.identity === currentPersona?.publicHexKey,
            )
            const result = walletsList.reduce((res: WalletProof[], x) => {
                const temp = (kvCache?.content[PluginId.Tip] as WalletProof[]).filter((i) =>
                    isSameAddress(x.identity, i.identity),
                )
                if (temp && temp.length > 0) {
                    x = temp[0]
                }
                res.push(x as WalletProof)
                return res
            }, [])
            const idx = result.findIndex((x) => x.isDefault)
            if (idx !== -1) {
                result.unshift(result.splice(idx, 1)[0])
            }
            setRawWalletList(JSON.parse(JSON.stringify(result)))
            setRawPatchData(JSON.parse(JSON.stringify(result)))
            return
        }
        ;(walletsList as WalletProof[]).forEach((x, idx) => {
            x.isPublic = 1
            x.isDefault = 0
            if (idx === 0) {
                x.isDefault = 1
                return
            }
        })
        setRawWalletList(JSON.parse(JSON.stringify(walletsList)))
        setRawPatchData(JSON.parse(JSON.stringify(walletsList)))
    }, [proofRes, kv, open, bodyView])

    const onCancel = () => {
        setRawPatchData(JSON.parse(JSON.stringify(rawWalletList)))
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
        rawPatchData.forEach((x: any) => (x.isDefault = 0))
        rawPatchData[idx].isDefault = 1
        rawPatchData.unshift(rawPatchData.splice(idx, 1)[0])
        setHasChanged(true)
    }

    const onSwitchChange = (idx: number, v: boolean) => {
        rawPatchData[idx].isPublic = v ? 1 : 0
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
    }, [hasChanged])
    const [confirmState, onConfirmRelease] = useAsyncFn(async (wallet?: WalletProof) => {
        try {
            if (!currentPersona?.publicHexKey || !wallet) throw new Error('failed')

            const result = await NextIDProof.createPersonaPayload(
                currentPersona.publicHexKey,
                NextIDAction.Delete,
                wallet.identity,
                wallet.platform,
            )
            if (!result) throw new Error('payload error')

            const signature = await Services.Identity.generateSignResult(currentPersona.identifier, result.signPayload)

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
            console.error(error)
            return false
        }
    })
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
                        <Empty toAdd={() => setBodyView(BodyViewSteps.addWallet)} />
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
                                className={classes.cancelBtn}
                                fullWidth
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
