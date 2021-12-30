import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PageHeader } from '../components/PageHeader'
import { MaskMessages, useI18N } from '../../../../../utils'
import { useLocation } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import Services from '../../../../service'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'
import { Typography } from '@mui/material'
import { FormattedAddress, useValueRef } from '@masknet/shared'
import { useHasPassword } from '../../../hook/useHasPassword'
import type { z as zod } from 'zod'
import { Controller } from 'react-hook-form'
import { usePasswordForm } from '../hooks/usePasswordForm'
import { PasswordField } from '../../../components/PasswordField'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { LoadingButton } from '@mui/lab'
import { currentPersonaIdentifier } from '../../../../../settings/settings'

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
    const location = useLocation()

    const currentPersona = useValueRef(currentPersonaIdentifier)

    const backupId = new URLSearchParams(location.search).get('backupId')

    const { loading, value } = useAsync(async () => {
        if (backupId) return Services.Welcome.getUnconfirmedBackup(backupId)
        return undefined
    }, [backupId])

    const { hasPassword, loading: getHasPasswordLoading } = useHasPassword()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        schema,
    } = usePasswordForm()

    const [{ loading: setPasswordLoading }, handleSetPassword] = useAsyncFn(
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

    const onSubmit = handleSubmit(handleSetPassword)

    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        // If the payment password does not exist, set it first
        if (!hasPassword) {
            await onSubmit()
        }

        if (backupId) {
            const json = await Services.Welcome.getUnconfirmedBackup(backupId)
            if (json) {
                await Services.Welcome.restoreBackup(json)

                // Set default wallet
                if (json.wallets) await WalletRPC.setDefaultWallet()

                // Send event after successful recovery
                MaskMessages.events.restoreSuccess.sendToAll(undefined)

                await Services.Helper.removePopupWindow()
            }
        }
    }, [onSubmit, hasPassword, currentPersona, backupId])

    return loading || getHasPasswordLoading ? (
        <LoadingPlaceholder />
    ) : (
        <>
            <div className={classes.container}>
                <PageHeader title={t('popups_wallet_recovered')} />
                <div style={{ padding: 6 }}>
                    {value?.wallets.map((wallet) => {
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
                                    render={({ field }) => (
                                        <PasswordField
                                            classes={{ root: classes.textField }}
                                            {...field}
                                            error={!isValid && !!errors.confirm?.message}
                                            helperText={!isValid ? errors.confirm?.message : ''}
                                            type="password"
                                            variant="filled"
                                            placeholder={t('popups_wallet_re_payment_password')}
                                        />
                                    )}
                                    name="confirm"
                                    control={control}
                                />
                            </div>
                            <Typography className={classes.tips}>{t('popups_wallet_payment_password_tip')}</Typography>
                        </form>
                    ) : null}
                </div>
            </div>
            <div className={classes.controller}>
                <LoadingButton
                    loading={setPasswordLoading || confirmLoading}
                    fullWidth
                    loadingPosition="end"
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
