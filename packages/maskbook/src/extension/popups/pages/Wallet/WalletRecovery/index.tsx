import { memo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { PageHeader } from '../components/PageHeader'
import { useI18N } from '../../../../../utils'
import { useHistory, useLocation } from 'react-router-dom'
import { useAsync, useAsyncFn } from 'react-use'
import Services from '../../../../service'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'
import { Typography } from '@mui/material'
import { FormattedAddress } from '@masknet/shared'
import { useHasPassword } from '../../../hook/useHasPassword'
import { useWalletLockStatus } from '../hooks/useWalletLockStatus'
import type { z as zod } from 'zod'
import { Controller } from 'react-hook-form'
import { usePasswordForm } from '../hooks/usePasswordForm'
import { PasswordField } from '../../../components/PasswordField'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { LoadingButton } from '@mui/lab'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px',
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
    const [password, setPassword] = useState('')
    const history = useHistory()
    const [{ value: hasError, loading: unlockLoading }, handleUnlock] = useAsyncFn(async () => {
        const result = await WalletRPC.unlockWallet(password)
        if (result) {
            await Services.Helper.removePopupWindow()
            return false
        } else {
            return true
        }
    }, [password])

    const backupId = new URLSearchParams(location.search).get('backupId')

    const { loading, value } = useAsync(async () => {
        if (backupId) return Services.Welcome.getUnconfirmedBackup(backupId)
        return undefined
    }, [backupId])

    const { hasPassword, loading: getHasPasswordLoading } = useHasPassword()
    const { isLocked, loading: getLockStatusLoading } = useWalletLockStatus()

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
                await Services.Helper.removePopupWindow()
            } catch (error) {
                if (error instanceof Error) {
                    setError('password', { message: error.message })
                }
            }
        },
        [history, setError],
    )

    const onSubmit = handleSubmit(handleSetPassword)

    const onConfirm = useCallback(async () => {
        if (!hasPassword) {
            await onSubmit()
        }
        if (isLocked) await handleUnlock()
    }, [onSubmit, isLocked, handleUnlock, hasPassword])

    return loading || getHasPasswordLoading || getLockStatusLoading ? (
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
                                    <FormattedAddress address={wallet.address} size={16} />
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
                                            placeholder="Re-enter the payment password"
                                        />
                                    )}
                                    name="confirm"
                                    control={control}
                                />
                            </div>
                            <Typography className={classes.tips}>{t('popups_wallet_payment_password_tip')}</Typography>
                        </form>
                    ) : null}
                    {hasPassword && isLocked ? (
                        <div>
                            <Typography className={classes.label}>{t('popups_wallet_payment_password')}</Typography>
                            <PasswordField
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                error={hasError}
                                placeholder={t('popups_wallet_payment_password')}
                                helperText={hasError ? t('popups_wallet_unlock_error_password') : ''}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
            <div className={classes.controller}>
                <LoadingButton
                    loading={unlockLoading || setPasswordLoading}
                    fullWidth
                    disabled={hasPassword ? !password : !isValid}
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
