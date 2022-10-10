import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import {
    PluginID,
    BindingProof,
    CrossIsolationMessages,
    ECKeyIdentifier,
    EMPTY_LIST,
    NextIDPlatform,
    PopupRoutes,
} from '@masknet/shared-base'
import { useHiddenAddressSetting, useWeb3State } from '@masknet/web3-hooks-base'
import { WalletSettingCard } from '@masknet/shared'
import { useAsyncFn, useUpdateEffect } from 'react-use'

import { differenceWith, uniq } from 'lodash-unified'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useSharedI18N } from '../../../locales'
import { SettingActions } from './SettingActions.js'

export type PublicWalletSettingType = {
    hiddenAddresses?: string[]
    defaultAddress?: string
}

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: 16,
        minHeight: 424,
        display: 'flex',
        flexDirection: 'column',
    },
    alert: {
        padding: theme.spacing(1.5),
        background: theme.palette.maskColor.bg,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 4,
    },
    alertTitle: {
        lineHeight: '18px',
    },
    placeholder: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        rowGap: 12,
    },
    placeholderText: {
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    placeholderIcon: {
        color: theme.palette.maskColor.third,
    },
    content: {
        marginTop: 12,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        '& > div': {
            flex: 1,
            maxWidth: 'calc(50% - 22px)',
        },
    },
}))

interface PublicWalletSettingProps {
    onClose: () => void
    onOpenPopup: (route?: PopupRoutes, params?: Record<string, any>) => void
    bindingWallets?: BindingProof[]
    currentPersona?: ECKeyIdentifier
    pluginId: PluginID
}

export const PublicWalletSetting = memo<PublicWalletSettingProps>(
    ({ onClose, bindingWallets, currentPersona, pluginId, onOpenPopup }) => {
        const { classes } = useStyles()
        const t = useSharedI18N()
        const { Storage } = useWeb3State()

        const [addresses, setAddresses] = useState<string[]>([])
        const [showAlert, setShowAlert] = useState(true)
        const { showSnackbar } = useCustomSnackbar()

        const { value: hiddenAddresses, loading } = useHiddenAddressSetting(pluginId, currentPersona?.publicKeyAsHex)

        const onSwitchChange = useCallback((address: string) => {
            setAddresses((prev) => {
                return prev.some((x) => isSameAddress(address, x))
                    ? prev.filter((x) => !isSameAddress(address, x))
                    : [...prev, address]
            })
        }, [])

        const disabled = useMemo(() => {
            // If `hiddenAddresses` setting length is different from `addresses`
            if (hiddenAddresses?.length !== addresses.length) return false

            // If `addresses` is different from setting
            if (differenceWith(hiddenAddresses ?? EMPTY_LIST, addresses, isSameAddress).length) return false

            return true
        }, [addresses, hiddenAddresses])

        const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
            try {
                if (!Storage || !currentPersona) return
                const storage = Storage.createNextIDStorage(
                    currentPersona.publicKeyAsHex,
                    NextIDPlatform.NextID,
                    currentPersona,
                )
                const prevResult = storage.get<PublicWalletSettingType>(pluginId)

                await storage.set<PublicWalletSettingType>(pluginId, {
                    ...prevResult,
                    hiddenAddresses: uniq(addresses),
                })

                showSnackbar(t.save_successfully(), {
                    variant: 'success',
                    message: t.wallet_set_up_successfully(),
                    autoHideDuration: 2000,
                })
                CrossIsolationMessages.events.walletSettingsDialogEvent.sendToAll({ pluginID: pluginId })
                onClose()
            } catch {
                showSnackbar(t.save_failed(), {
                    variant: 'error',
                    message: t.wallet_set_up_failed(),
                    autoHideDuration: 2000,
                })
            }
        }, [Storage, currentPersona, addresses, pluginId])

        useUpdateEffect(() => {
            if (!hiddenAddresses) return
            setAddresses(hiddenAddresses)
        }, [hiddenAddresses])

        const onOpenConnectWallet = useCallback(() => {
            onOpenPopup(PopupRoutes.ConnectedWallets, {
                internal: true,
            })
        }, [onOpenPopup])

        const EmptyHintMapping = useMemo(() => {
            const mapping: Record<string, string> = {
                [PluginID.Tips]: t.add_wallet_tips(),
                [PluginID.Web3Profile]: t.add_wallet_web3_profile(),
            }

            return mapping[pluginId] ?? t.add_wallet_web3_profile()
        }, [pluginId, t])

        if (loading) {
            return (
                <div className={classes.container}>
                    <div className={classes.placeholder}>
                        <LoadingBase />
                    </div>
                </div>
            )
        }

        return (
            <>
                <div className={classes.container}>
                    {showAlert ? (
                        <div className={classes.alert}>
                            <Box display="flex" alignItems="center" columnGap="6px">
                                <Icons.Info />
                                <Typography className={classes.alertTitle}>{t.setting_alert_title()}</Typography>
                            </Box>
                            <Icons.Close onClick={() => setShowAlert(false)} size={20} />
                        </div>
                    ) : null}
                    {bindingWallets?.length ? (
                        <div className={classes.content}>
                            {bindingWallets.map((wallet, index) => (
                                <WalletSettingCard
                                    wallet={wallet}
                                    key={index}
                                    checked={!addresses.includes(wallet.identity)}
                                    onSwitchChange={onSwitchChange}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={classes.placeholder}>
                            <Icons.EmptySimple size={36} className={classes.placeholderIcon} />
                            <Typography className={classes.placeholderText}>{EmptyHintMapping}</Typography>
                        </div>
                    )}
                </div>
                <SettingActions
                    hasWallet={!!bindingWallets?.length}
                    onClose={onClose}
                    disableConfirm={disabled}
                    confirmLoading={confirmLoading}
                    onConfirm={onConfirm}
                    onOpenConnectWallet={onOpenConnectWallet}
                />
            </>
        )
    },
)
