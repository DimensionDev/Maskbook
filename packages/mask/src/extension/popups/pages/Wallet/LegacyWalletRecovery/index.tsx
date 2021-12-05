import { memo } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { Controller } from 'react-hook-form'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { PageHeader } from '../components/PageHeader'
import { useI18N } from '../../../../../utils'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'
import { Typography } from '@mui/material'
import { FormattedAddress, PopupRoutes } from '@masknet/shared'
import { useHasPassword } from '../../../hook/useHasPassword'
import type { z as zod } from 'zod'
import { usePasswordForm } from '../hooks/usePasswordForm'
import { PasswordField } from '../../../components/PasswordField'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { LoadingButton } from '@mui/lab'
import Services from '../../../../service'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px 80px 10px',
    },
    textField: {
        marginTop: 10,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
        marginBottom: 10,
    },
    tips: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginTop: 10,
    },
    wallet: {
        marginBottom: 20,
    },
    address: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
        fontWeight: 600,
    },
    controller: {
        padding: '20px 10px',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 10px',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

const WalletRecovery = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()
    const { hasPassword, loading: getHasPasswordLoading } = useHasPassword()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        schema,
    } = usePasswordForm(!hasPassword)

    const { value: legacyWallets = [], loading: getLegacyWalletsLoading } = useAsyncRetry(async () => {
        const now = new Date()
        const wallets = await WalletRPC.getLegacyWallets(ProviderType.MaskWallet)
        if (!wallets.length) return []
        return wallets.filter((x) => (x.mnemonic || x._public_key_) && x.updatedAt < now)
    }, [])

    const [{ loading: restoreLegacyWalletLoading }, handleRestoreLegacyWallet] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            try {
                await WalletRPC.setPassword(data.password)
            } catch (error) {
                if (error instanceof Error) {
                    setError('password', { message: error.message })
                }
            }
        },
        [setError],
    )

    const onSubmit = handleSubmit(handleRestoreLegacyWallet)

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        if (!hasPassword) {
            await onSubmit()
        }

        // restore wallet and ignore the result
        await Promise.allSettled(
            legacyWallets.map(async (x) => {
                const name = x.name ?? 'Mask Wallet'
                if (x._private_key_) await WalletRPC.recoverWalletFromPrivateKey(name, x._private_key_)
                else await WalletRPC.recoverWalletFromMnemonic(name, x.mnemonic.join(' '))
            }),
        )

        // double check the restoring result
        await Promise.allSettled(
            legacyWallets.map(async (x) => {
                if (await WalletRPC.hasWallet(x.address)) await WalletRPC.freezeLegacyWallet(x.address)
            }),
        )

        await Services.Helper.removePopupWindow()
        history.replace(PopupRoutes.Wallet)
    }, [onSubmit, hasPassword, legacyWallets.map((x) => x.address).join(), history])

    return getHasPasswordLoading || getLegacyWalletsLoading ? (
        <LoadingPlaceholder />
    ) : (
        <>
            <div className={classes.container}>
                <PageHeader title={t('popups_wallet_recovered')} />
                <div style={{ padding: 6 }}>
                    {legacyWallets.map((wallet) => {
                        return (
                            <div className={classes.wallet} key={wallet.address}>
                                <Typography className={classes.label}>{wallet.name}</Typography>
                                <Typography className={classes.address}>
                                    <FormattedAddress
                                        address={wallet.address}
                                        size={16}
                                        formatter={formatEthereumAddress}
                                    />
                                </Typography>
                            </div>
                        )
                    })}
                    {!hasPassword ? (
                        <form className={classes.form}>
                            <div style={{ marginTop: 16 }}>
                                <Typography className={classes.label}>
                                    {t('popups_wallet_set_up_payment_password')}
                                </Typography>
                                <Controller
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordField
                                            {...field}
                                            classes={{ root: classes.textField }}
                                            type="password"
                                            variant="filled"
                                            placeholder={t('popups_wallet_payment_password')}
                                            error={!isValid && !!errors.password?.message}
                                            helperText={!isValid ? errors.password?.message : ''}
                                        />
                                    )}
                                    name="password"
                                />
                                <Controller
                                    control={control}
                                    render={({ field }) => (
                                        <PasswordField
                                            classes={{ root: classes.textField }}
                                            {...field}
                                            error={!isValid && !!errors.confirm?.message}
                                            helperText={!isValid ? errors.confirm?.message : ''}
                                            type="password"
                                            variant="filled"
                                            placeholder="Re-enter the payment password"
                                        />
                                    )}
                                    name="confirm"
                                />
                            </div>
                            <Typography className={classes.tips}>{t('popups_wallet_payment_password_tip')}</Typography>
                        </form>
                    ) : null}
                </div>
            </div>
            <div className={classes.controller}>
                <LoadingButton
                    loading={restoreLegacyWalletLoading || confirmLoading}
                    loadingPosition="end"
                    fullWidth
                    disabled={!hasPassword ? !isValid : false}
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    variant="contained"
                    onClick={onConfirm}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default WalletRecovery
