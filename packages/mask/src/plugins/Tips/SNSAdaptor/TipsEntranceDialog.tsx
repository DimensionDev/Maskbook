import { useWeb3State } from '@masknet/plugin-infra/web3'
import { InjectedDialog, useSnackbarCallback } from '@masknet/shared'
import { PluginId } from '@masknet/plugin-infra'
import {
    BindingProof,
    NextIDPlatform,
    CrossIsolationMessages,
    EMPTY_LIST,
    formatPersonaFingerprint,
} from '@masknet/shared-base'
import { LoadingBase, makeStyles, useCustomSnackbar, ActionButton } from '@masknet/theme'
import { NetworkPluginID, isSameAddress, isGreaterThan } from '@masknet/web3-shared-base'
import { DialogContent, DialogActions, Avatar, Typography } from '@mui/material'
import { delay } from '@dimensiondev/kit'
import { sortBy, last } from 'lodash-unified'
import { useCopyToClipboard, useAsyncFn, useAsyncRetry } from 'react-use'
import { useCallback, useMemo, useState } from 'react'
import Services from '../../../extension/service'
import { useProvedWallets } from '../hooks/useProvedWallets'
import { useI18N } from '../locales'
import { getNowTime } from '../utils'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { WalletsByNetwork } from './components/WalletsByNetwork'
import { Icons } from '@masknet/icons'
import { useTipsSetting } from '../hooks/useTipsSetting'
import type { TipsSettingType } from '../types'

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
        justifyContent: 'space-between',
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
    titleTailIcon: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    personaInfo: {
        display: 'flex',
        alignItems: 'center',

        columnGap: 4,
    },
    nickname: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    fingerprint: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.third,
    },
    copyIcon: {
        color: theme.palette.maskColor.second,
    },
    avatar: {
        width: 30,
        height: 30,
    },
}))

const supportedNetworkIds = [NetworkPluginID.PLUGIN_EVM]

export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const { Storage } = useWeb3State()

    const [showAlert, setShowAlert] = useState(true)
    const [pendingDefault, setPendingDefault] = useState<string>()

    const { showSnackbar } = useCustomSnackbar()

    const { value: currentPersonaIdentifier } = useAsyncRetry(() => {
        setShowAlert(true)
        return Services.Settings.getCurrentPersonaIdentifier()
    }, [open])

    const { value: currentPersona } = useAsyncRetry(() => {
        return Services.Identity.queryPersona(currentPersonaIdentifier!)
    }, [currentPersonaIdentifier])

    const { loading, value: proofRes } = useProvedWallets()

    const { value: TipsSetting, retry: retrySetting } = useTipsSetting(currentPersonaIdentifier)

    // Sort By `last_checked_at`
    const bindingWallets = useMemo(() => {
        if (!proofRes?.length) return EMPTY_LIST
        return sortBy(proofRes, (x) => -Number.parseInt(x.last_checked_at, 10)).map(
            (wallet, index, list): BindingProof => ({
                ...wallet,
                rawIdx: list.length - index - 1,
            }),
        )
    }, [proofRes])

    // if the defaultAddress isn't exist, The first checked is default
    const defaultAddress = TipsSetting?.defaultAddress ?? last(bindingWallets)?.identity

    // The default wallet must be in the first
    const sortedWallet = useMemo(() => {
        return bindingWallets.sort((a, z) => {
            if (isGreaterThan(a.last_checked_at, z.last_checked_at)) {
                if (isSameAddress(z.identity, defaultAddress)) return 1
                return -1
            }

            if (isSameAddress(a.identity, defaultAddress)) return -1
            return 1
        })
    }, [defaultAddress, bindingWallets])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!Storage || !currentPersonaIdentifier || !pendingDefault) return
        try {
            const storage = Storage.createNextIDStorage(
                currentPersonaIdentifier.publicKeyAsHex,
                NextIDPlatform.NextID,
                currentPersonaIdentifier,
            )
            storage.set<TipsSettingType>(PluginId.Tips, {
                ...TipsSetting,
                defaultAddress: pendingDefault,
            })

            // Waiting for data synchronization
            await delay(2000)
            retrySetting()
            setPendingDefault('')

            showSnackbar(t.tip_persona_sign_success(), {
                variant: 'success',
                message: getNowTime(),
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(t.tip_persona_sign_error(), {
                variant: 'error',
                message: getNowTime(),
                autoHideDuration: 2000,
            })
        }
    }, [TipsSetting, Storage, currentPersonaIdentifier, retrySetting, pendingDefault])

    const handleOpenSettingDialog = useCallback(
        () =>
            CrossIsolationMessages.events.PluginSettingsDialogUpdate.sendToLocal({
                open: true,
                targetTab: PluginId.Tips,
            }),
        [],
    )

    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(currentPersona?.identifier.rawPublicKey ?? ''),
        deps: [currentPersona?.identifier.rawPublicKey],
        successText: t.copy_success(),
    })

    // TODO: Listens for event messages added by the bound wallet and refreshes the proof data

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t.tips()}
            titleTail={<Icons.Gear size={24} onClick={handleOpenSettingDialog} className={classes.titleTailIcon} />}>
            {loading ? (
                <DialogContent className={classes.dialogContent}>
                    <div className={classes.loading}>
                        <LoadingBase />
                    </div>
                </DialogContent>
            ) : (
                <DialogContent className={classes.dialogContent}>
                    {showAlert ? (
                        <div className={classes.alertBox}>
                            <VerifyAlertLine onClose={() => setShowAlert(false)} />
                        </div>
                    ) : null}

                    <div>
                        {supportedNetworkIds?.map((x, idx) => {
                            return (
                                <WalletsByNetwork
                                    wallets={sortedWallet}
                                    toSetting={handleOpenSettingDialog}
                                    key={idx}
                                    networkId={x}
                                    defaultAddress={pendingDefault || defaultAddress}
                                    setAsDefault={(address: string) => setPendingDefault(address)}
                                />
                            )
                        })}
                    </div>
                </DialogContent>
            )}

            <DialogActions className={classes.actions}>
                <div className={classes.personaInfo}>
                    {currentPersona?.avatar ? (
                        <Avatar src={currentPersona.avatar} className={classes.avatar} />
                    ) : (
                        <Icons.MenuPersonasActive
                            color="#f9fafa"
                            size={30}
                            style={{ backgroundColor: '#F9FAFA', borderRadius: 99 }}
                        />
                    )}
                    <div>
                        <Typography className={classes.nickname}>{currentPersona?.nickname}</Typography>
                        <Typography className={classes.fingerprint}>
                            {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '', 4)}
                            <Icons.PopupCopy onClick={onCopy} size={14} className={classes.copyIcon} />
                        </Typography>
                    </div>
                </div>
                <ActionButton
                    loading={confirmLoading}
                    disabled={!pendingDefault || isSameAddress(pendingDefault, defaultAddress)}
                    onClick={onConfirm}>
                    {t.confirm()}
                </ActionButton>
            </DialogActions>
        </InjectedDialog>
    )
}
