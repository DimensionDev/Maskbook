import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, useCallback, useState } from 'react'
import { BindingProof, ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { useHiddenAddressSetting, useWeb3State } from '@masknet/plugin-infra/web3'
import { PluginId } from '@masknet/plugin-infra'
import { WalletSettingCard } from '@masknet/shared'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useAsyncFn, useUpdateEffect } from 'react-use'

import type { TipsSettingType } from '../types'
import { useI18N } from '../locales'
import { SettingActions } from './components/SettingActions'
import { PluginNextIDMessages } from '../messages'

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
        alignItems: 'center',
        borderRadius: 4,
        columnGap: 6,
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

    const { showSnackbar } = useCustomSnackbar()

    const { value: hiddenAddress, loading } = useHiddenAddressSetting(PluginId.Tips, currentPersona?.publicKeyAsHex)

    const onSwitchChange = useCallback((address: string) => {
        setAddresses((prev) => {
            return prev.includes(address) ? prev.filter((x) => !isSameAddress(address, x)) : [...prev, address]
        })
    }, [])

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
        if (!hiddenAddress) return
        setAddresses(hiddenAddress)
    }, [hiddenAddress])

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
                <div className={classes.alert}>
                    <Icons.Info />
                    <Typography className={classes.alertTitle}>{t.setting_alert_title()}</Typography>
                </div>
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
                        <Icons.Direct size={36} className={classes.placeholderIcon} />
                        <Typography className={classes.placeholderText}>{t.add_wallet_tips()}</Typography>
                    </div>
                )}
            </div>
            <SettingActions
                hasWallet={!!bindingWallets?.length}
                onClose={onClose}
                disableConfirm={addresses.length === hiddenAddress?.length}
                confirmLoading={confirmLoading}
                onConfirm={onConfirm}
            />
        </>
    )
})
