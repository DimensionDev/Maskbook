import { memo } from 'react'
import type { z as zod } from 'zod'
import { useI18N } from '../../../../../utils'
import { Typography } from '@mui/material'
import { Controller } from 'react-hook-form'
import { PasswordField } from '../../../components/PasswordField'
import { makeStyles } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@mui/lab'
import { usePasswordForm } from '../hooks/usePasswordForm'

const useStyles = makeStyles()({
    container: {
        padding: '16px 10px',
        flex: 1,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        color: '#151818',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    textField: {
        marginTop: 10,
    },
    form: {
        marginTop: 26,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    tips: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginTop: 10,
    },
    button: {
        fontWeight: 600,
        marginTop: 20,
        padding: '9px 10px',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
    controller: {
        padding: '16px 10px',
    },
})

const SetPaymentPassword = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        schema,
    } = usePasswordForm()

    const [{ loading }, onConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            try {
                await WalletRPC.setPassword(data.password)
                history.replace(PopupRoutes.ImportWallet)
            } catch (error) {
                if (error instanceof Error) {
                    setError('password', { message: error.message })
                }
            }
        },
        [history, setError],
    )

    const onSubmit = handleSubmit(onConfirm)

    return (
        <>
            <div className={classes.container}>
                <div className={classes.header}>
                    <Typography className={classes.title}>{t('popups_wallet_set_payment_password')}</Typography>
                </div>
                <form className={classes.form}>
                    <div style={{ marginTop: 16 }}>
                        <Typography className={classes.label}>{t('popups_wallet_payment_password')}</Typography>
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
            </div>
            <div className={classes.controller}>
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    fullWidth
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    disabled={!isValid}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </>
    )
})

export default SetPaymentPassword
