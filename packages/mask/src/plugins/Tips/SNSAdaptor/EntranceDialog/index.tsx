import { useCallback, useMemo, useState, useEffect } from 'react'
import { useCopyToClipboard, useAsyncFn, useAsyncRetry, useUpdateEffect } from 'react-use'
import { sortBy, last } from 'lodash-unified'
import { PluginID } from '@masknet/plugin-infra'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { InjectedDialog, useSnackbarCallback } from '@masknet/shared'
import {
    NextIDPlatform,
    CrossIsolationMessages,
    EMPTY_LIST,
    formatPersonaFingerprint,
    PopupRoutes,
} from '@masknet/shared-base'
import { LoadingBase, makeStyles, useCustomSnackbar, ActionButton } from '@masknet/theme'
import { NetworkPluginID, isSameAddress, isGreaterThan } from '@masknet/web3-shared-base'
import { DialogContent, DialogActions, Avatar, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { delay } from '@dimensiondev/kit'
import Services from '../../../../extension/service.js'
import { useI18N } from '../../locales/index.js'
import { VerifyAlertLine } from './VerifyAlertLine.js'
import { WalletsByNetwork } from './WalletsByNetwork.js'
import { useOwnProofs } from '../hooks/useOwnProofs.js'
import { useSettings } from '../hooks/useSettings.js'
import type { Settings } from '../../types/index.js'
import { MaskMessages } from '../../../../utils/index.js'

export interface EntranceDialogProps {
    open: boolean
    onClose: () => void
}
const useStyles = makeStyles()((theme) => ({
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
        minHeight: 544,
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

const SUPPORTED_NETWORK_IDS = [NetworkPluginID.PLUGIN_EVM]

export function EntranceDialog({ open, onClose }: EntranceDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const { Storage } = useWeb3State()

    const [showAlert, setShowAlert] = useState(true)
    const [pendingDefault, setPendingDefault] = useState<string>()

    const { showSnackbar } = useCustomSnackbar()

    const { value: currentPersonaIdentifier, retry: retryCurrentPersona } = useAsyncRetry(() => {
        setShowAlert(true)
        return Services.Settings.getCurrentPersonaIdentifier()
    }, [open])

    const { value: currentPersona } = useAsyncRetry(() => {
        return Services.Identity.queryPersona(currentPersonaIdentifier!)
    }, [currentPersonaIdentifier])

    const { loading, value: proofs } = useOwnProofs(NextIDPlatform.Ethereum)

    const { value: settings, retry: retrySettings } = useSettings(currentPersonaIdentifier?.publicKeyAsHex)

    // Sort By `last_checked_at`
    const bindingWallets = useMemo(() => {
        if (!proofs?.length) return EMPTY_LIST
        return sortBy(proofs, (x) => -Number.parseInt(x.last_checked_at, 10)).map((wallet, index, list) => ({
            ...wallet,
            fallbackName: `Wallet ${list.length - index}`,
        }))
    }, [proofs])

    // if the defaultAddress isn't exist, The first checked is default
    const defaultAddress = settings?.defaultAddress ?? last(bindingWallets)?.identity

    // The default wallet must be in the first
    const sortedWallets = useMemo(() => {
        return bindingWallets
            .filter((x) => !settings?.hiddenAddresses?.includes(x.identity))
            .sort((a, z) => {
                if (isGreaterThan(a.last_checked_at, z.last_checked_at)) {
                    return isSameAddress(z.identity, defaultAddress) ? 1 : -1
                }
                return isSameAddress(a.identity, defaultAddress) ? -1 : 1
            })
    }, [defaultAddress, bindingWallets, settings?.hiddenAddresses])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!Storage || !currentPersonaIdentifier || !pendingDefault) return
        try {
            const storage = Storage.createNextIDStorage(
                currentPersonaIdentifier.publicKeyAsHex,
                NextIDPlatform.NextID,
                currentPersonaIdentifier,
            )
            storage.set<Settings>(PluginID.Tips, {
                ...settings,
                defaultAddress: pendingDefault,
            })

            // Waiting for data synchronization
            await delay(2000)
            retrySettings()
            setPendingDefault('')

            showSnackbar(t.tip_persona_sign_success(), {
                variant: 'success',
                message: t.tip_default_set_successfully_description(),
                autoHideDuration: 2000,
            })
        } catch {
            showSnackbar(t.tip_persona_sign_error(), {
                variant: 'error',
                message: t.tip_default_set_failed_description(),
                autoHideDuration: 2000,
            })
        }
    }, [settings, Storage, currentPersonaIdentifier, retrySettings, pendingDefault])

    const handleOpenSettingDialog = useCallback(
        () =>
            CrossIsolationMessages.events.settingsDialogEvent.sendToLocal({
                open: true,
                targetTab: PluginID.Tips,
            }),
        [],
    )

    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(currentPersona?.identifier.rawPublicKey ?? ''),
        deps: [currentPersona?.identifier.rawPublicKey],
        successText: t.copy_success(),
    })

    const openConnectWallet = useCallback(() => Services.Helper.openPopupWindow(PopupRoutes.ConnectWallet), [])

    useEffect(() => {
        return CrossIsolationMessages.events.walletSettingsDialogEvent.on((x) => {
            if (x.pluginID === PluginID.Tips) retrySettings()
        })
    }, [retrySettings])

    useEffect(() => {
        return MaskMessages.events.ownPersonaChanged.on(retryCurrentPersona)
    }, [retryCurrentPersona])

    // reset pending default wallet after dialog open changed
    useUpdateEffect(() => {
        setPendingDefault(undefined)
    }, [open])

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
                        {SUPPORTED_NETWORK_IDS?.map((x, idx) => {
                            return (
                                <WalletsByNetwork
                                    wallets={sortedWallets}
                                    key={idx}
                                    toSetting={handleOpenSettingDialog}
                                    notEmpty={!!bindingWallets.length}
                                    networkId={x}
                                    defaultAddress={pendingDefault || defaultAddress}
                                    setAsDefault={(address: string) => setPendingDefault(address)}
                                    openConnectWallet={openConnectWallet}
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
                        <Icons.MenuPersonasActive size={30} style={{ borderRadius: 99 }} />
                    )}
                    <div>
                        <Typography className={classes.nickname}>{currentPersona?.nickname}</Typography>
                        <Typography className={classes.fingerprint}>
                            {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '', 4)}
                            <Icons.PopupCopy onClick={onCopy} size={14} className={classes.copyIcon} />
                        </Typography>
                    </div>
                </div>
                {!!bindingWallets.length && sortedWallets.length ? (
                    <ActionButton
                        loading={confirmLoading}
                        disabled={!pendingDefault || isSameAddress(pendingDefault, defaultAddress)}
                        onClick={onConfirm}>
                        {t.confirm()}
                    </ActionButton>
                ) : null}
            </DialogActions>
        </InjectedDialog>
    )
}
