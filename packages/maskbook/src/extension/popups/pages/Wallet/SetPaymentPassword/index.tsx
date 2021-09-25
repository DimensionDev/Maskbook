import { memo, useMemo } from 'react'
import { z as zod } from 'zod'
import { useI18N } from '../../../../../utils'
import { Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { PasswordField } from '../../../components/PasswordField'
import { zodResolver } from '@hookform/resolvers/zod'
import { makeStyles } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@mui/lab'

const useStyles = makeStyles()({
    container: {
        padding: '16px 10px',
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
        marginTop: 20,
        padding: '9px 10px',
        borderRadius: 20,
    },
})

const SetPaymentPassword = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()
    const schema = useMemo(() => {
        return zod
            .object({
                password: zod
                    .string()
                    .min(8, t('popups_wallet_password_length_error'))
                    .max(20, t('popups_wallet_password_length_error'))
                    .refine(
                        (input) =>
                            [/[A-Z]/, /[a-z]/, /\d/, /[^\dA-Za-z]/].filter((regex) => regex.test(input)).length >= 2,
                        t('popups_wallet_password_dont_match'),
                    ),
                confirm: zod.string().min(8).max(20),
            })
            .refine((data) => data.password === data.confirm, {
                message: t('popups_wallet_password_dont_match'),
                path: ['confirm'],
            })
    }, [])

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
            confirm: '',
        },
    })

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
            <LoadingButton
                loading={loading}
                variant="contained"
                fullWidth
                className={classes.button}
                disabled={!isValid}
                onClick={onSubmit}>
                {t('confirm')}
            </LoadingButton>
        </div>
    )
})

export default SetPaymentPassword
