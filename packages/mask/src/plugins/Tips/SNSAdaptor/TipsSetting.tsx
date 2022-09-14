import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { BindingProof, ECKeyIdentifier, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { WalletSettingCard } from '@masknet/shared'
import { useAsyncFn, useUpdateEffect } from 'react-use'

import { useTipsSetting } from '../hooks/useTipsSetting.js'
import type { TipsSettingType } from '../types/index.js'
import { useI18N } from '../locales/index.js'
import { SettingActions } from './components/SettingActions.js'
import { PluginNextIDMessages } from '../messages.js'
import { differenceWith } from 'lodash-unified'
import { isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: 16,
        minHeight: 460,
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
        fontSize: 14,
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
        fontSize: 14,
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
        '& > *': {
            flex: 1,
            maxWidth: 'calc(50% - 22px)',
        },
    },
}))
interface TipsSettingProps {
    onClose: () => void
    bindingWallets?: BindingProof[]
    currentPersona?: ECKeyIdentifier
}

export const TipsSetting = memo<TipsSettingProps>(({ onClose, bindingWallets, currentPersona }) => {
    const { classes } = useStyles()
    const t = useI18N()
    const { Storage } = useWeb3State()

    const [addresses, setAddresses] = useState<string[]>([])
    const [showAlert, setShowAlert] = useState(true)
    const { showSnackbar } = useCustomSnackbar()

    const { value: TipsSetting, loading } = useTipsSetting(currentPersona?.publicKeyAsHex)

    const onSwitchChange = useCallback((address: string) => {
        setAddresses((prev) => {
            return prev.some((x) => address === x) ? prev.filter((x) => address !== x) : [...prev, address]
        })
    }, [])

    const disabled = useMemo(() => {
        // If `hiddenAddresses` setting length is different from `addresses`
        if (TipsSetting?.hiddenAddresses?.length !== addresses.length) return false

        // If `addresses` is different from setting
        if (differenceWith(TipsSetting?.hiddenAddresses ?? EMPTY_LIST, addresses, isSameAddress).length) return false

        return true
    }, [addresses, TipsSetting?.hiddenAddresses])

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        try {
            if (!Storage || !currentPersona) return
            const storage = Storage.createNextIDStorage(
                currentPersona.publicKeyAsHex,
                NextIDPlatform.NextID,
                currentPersona,
            )
            const prevResult = storage.get<TipsSettingType>(PluginId.Tips)

            await storage.set<TipsSettingType>(PluginId.Tips, {
                ...prevResult,
                hiddenAddresses: addresses,
            })

            showSnackbar(t.save_successfully(), {
                variant: 'success',
                message: t.wallet_set_up_successfully(),
                autoHideDuration: 2000,
            })
            PluginNextIDMessages.tipsSettingUpdate.sendToAll()
            onClose()
        } catch {
            showSnackbar(t.save_failed(), {
                variant: 'error',
                message: t.wallet_set_up_failed(),
                autoHideDuration: 2000,
            })
        }
    }, [Storage, currentPersona, addresses])

    useUpdateEffect(() => {
        if (!TipsSetting?.hiddenAddresses) return
        setAddresses(TipsSetting.hiddenAddresses)
    }, [TipsSetting?.hiddenAddresses])

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
                        <Typography className={classes.placeholderText}>{t.add_wallet_tips()}</Typography>
                    </div>
                )}
            </div>
            <SettingActions
                hasWallet={!!bindingWallets?.length}
                onClose={onClose}
                disableConfirm={disabled}
                confirmLoading={confirmLoading}
                onConfirm={onConfirm}
            />
        </>
    )
})
